const API_URL =
"https://script.google.com/macros/s/AKfycbxTYkOuG_1hO0JuIywiTRPcsdMtGNaxz7va3Oa9qFz7viJ1K9DFJWsVj12Cn28Jzc7b/exec";


let consultationData = [];


/* LOAD DATA */

async function loadData() {

  const tableBody =
    document.getElementById("tableBody");

  tableBody.innerHTML = `
    <tr>
      <td colspan="6" class="loading">
        Memuat data...
      </td>
    </tr>
  `;

  try {

    const response =
      await fetch(
        API_URL + "?action=getData"
      );

    const result =
      await response.json();

    if (!result.success) {

      throw new Error(
        "Gagal mengambil data"
      );

    }

    consultationData =
      result.data || [];

    renderTable(
      consultationData
    );

    updateStatistics(
      consultationData
    );

  } catch (error) {

    console.error(error);

    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="loading">
          Gagal memuat data.
        </td>
      </tr>
    `;

  }

}


/* RENDER TABLE */

function renderTable(data) {

  const tableBody =
    document.getElementById(
      "tableBody"
    );

  if (!data.length) {

    tableBody.innerHTML = `
      <tr>
        <td colspan="6"
            class="loading">
          Belum ada data konsultasi.
        </td>
      </tr>
    `;

    return;
  }


  tableBody.innerHTML =
    data.map(
      (item, index) => {

        return `
          <tr>

            <td>
              ${index + 1}
            </td>

            <td>
              <strong>
                ${escapeHTML(item.id)}
              </strong>
            </td>

            <td>
              ${escapeHTML(item.nama)}
            </td>

            <td>
              ${escapeHTML(item.sekolah)}
            </td>

            <td>
              ${formatDate(item.tanggal)}
            </td>

            <td>
              ${escapeHTML(item.masalah)}
            </td>

          </tr>
        `;

      }
    ).join("");

}


/* STATISTICS */

function updateStatistics(data) {

  document.getElementById(
    "totalData"
  ).textContent =
    data.length;


  const schools =
    new Set(
      data
        .map(item => item.sekolah)
        .filter(Boolean)
    );

  document.getElementById(
    "totalSchool"
  ).textContent =
    schools.size;


  const today =
    new Date();

  const todayString =
    today.toISOString()
      .split("T")[0];


  const todayCount =
    data.filter(
      item =>
        String(item.tanggal)
          .substring(0, 10)
        === todayString
    ).length;


  document.getElementById(
    "todayData"
  ).textContent =
    todayCount;

}


/* FORM SUBMIT */

document
  .getElementById(
    "consultationForm"
  )
  .addEventListener(
    "submit",
    async function(event) {

      event.preventDefault();


      const button =
        document.getElementById(
          "submitButton"
        );

      const message =
        document.getElementById(
          "message"
        );


      const data = {

        nama:
          document.getElementById(
            "nama"
          ).value.trim(),

        sekolah:
          document.getElementById(
            "sekolah"
          ).value.trim(),

        tanggal:
          document.getElementById(
            "tanggal"
          ).value,

        masalah:
          document.getElementById(
            "masalah"
          ).value.trim()

      };


      button.disabled = true;

      button.textContent =
        "Menyimpan...";

      message.innerHTML = "";


      try {

        const response =
          await fetch(
            API_URL,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "text/plain;charset=utf-8"
              },

              body:
                JSON.stringify(data)
            }
          );


        const result =
          await response.json();


        if (!result.success) {

          throw new Error(
            result.message
          );

        }


        message.innerHTML = `
          <div class="success">
            ✓ Data berhasil disimpan.
            ID Konsultasi:
            <strong>
              ${escapeHTML(result.id)}
            </strong>
          </div>
        `;


        document
          .getElementById(
            "consultationForm"
          )
          .reset();


        loadData();


      } catch (error) {

        console.error(error);

        message.innerHTML = `
          <div class="error">
            ✕ Gagal menyimpan data.
            Silakan coba kembali.
          </div>
        `;

      }


      button.disabled = false;

      button.textContent =
        "Simpan Data Konsultasi";

    }
  );


/* SEARCH */

function filterData() {

  const keyword =
    document
      .getElementById(
        "searchInput"
      )
      .value
      .toLowerCase();


  const filtered =
    consultationData.filter(
      item =>

        String(item.nama)
          .toLowerCase()
          .includes(keyword)

        ||

        String(item.sekolah)
          .toLowerCase()
          .includes(keyword)

        ||

        String(item.masalah)
          .toLowerCase()
          .includes(keyword)

        ||

        String(item.tanggal)
          .toLowerCase()
          .includes(keyword)

    );


  renderTable(filtered);

}


/* FORMAT DATE */

function formatDate(value) {

  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (isNaN(date)) {
    return value;
  }

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );

}


/* SECURITY */

function escapeHTML(value) {

  if (value === null ||
      value === undefined) {
    return "";
  }

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* INITIAL LOAD */

loadData();
