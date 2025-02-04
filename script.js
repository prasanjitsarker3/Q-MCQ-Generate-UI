document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");
  const resultDiv = document.getElementById("result");
  const questionsList = document.getElementById("questionsList");
  const downloadButtonContainer = document.getElementById(
    "downloadButtonContainer"
  );
  const downloadPDFButton = document.getElementById("downloadPDF");

  function displayMCQ(data, type) {
    console.log("Question Answers", data, type);

    return `<div class="p-6 bg-white shadow-md rounded-lg">
                    <div class="border-b border-gray-200 mb-4">
                        <h2 class="text-2xl font-bold text-center mb-2">${type} Question Paper</h2>
                        <div class="flex justify-between text-sm mb-2">
                            <span>Total Questions: ${data.length}</span>
                        </div>
                    </div>
                    <div class="space-y-3">
                        ${data
                          .map(
                            (item, index) => `
                                <div class="mb-3 px-4 py-2 pt-1 border-b border-gray-200 last:border-0">
                                    <div class="mb-2 text-base">
                                        <span class="font-medium">Q.${
                                          index + 1
                                        }. </span>
                                        <span>${item.question}</span>
                                    </div>
                                    <div class="ml-6 space-y-1 mb-2">
                                        ${Object.entries(item.options)
                                          .map(
                                            ([key, value]) => `
                                                <div class="flex text-sm">
                                                    <span class="w-4">(${key})</span>
                                                    <span>${value}</span>
                                                </div>
                                            `
                                          )
                                          .join("")}
                                    </div>
                                    <div class="mt-1  text-base">
                                        <span class="font-medium">Correct Answer: </span>
                                        <span class="text-green-600 font-medium">
                                            (${item.answer}) ${
                              item.options[item.answer]
                            }
                                        </span>
                                    </div>
                                </div>
                            `
                          )
                          .join("")}
                    </div>
            </div>`;
  }

  function displayShortQuestion(data, type) {
    console.log("Short Question Answers", data, type);
    return `
      <div class="p-6 bg-white">
        <div class="border-b border-gray-200 mb-2">
          <h2 class="text-xl font-bold text-center mb-2"> ${type} Question Paper</h2>
          <div class="flex justify-between text-sm mb-2">
            <span>Total Questions: ${data.length}</span>
          </div>
        </div>
        <div class="space-y-3">
          ${data
            .map(
              (item, index) => `
            <div class="">
              <div class="mb-1 text-base">
                <span class="font-medium">Q.${index + 1}. </span>
                <span>${item.question}</span>
              </div>
              <div class=" text-sm">
               <span class="font-normal ">Ans.</span>
                <span>${item.answer}</span>
              </div>
              
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  function displayLongQuestion(data, type) {
    console.log("Long Question:", data, type);
    return `
      <div class="p-6 bg-white">
        <div class="border-b border-gray-200 mb-2">
          <h2 class="text-xl font-bold text-center mb-2">${type} Question Paper</h2>
          <div class="flex justify-between text-sm mb-2">
            <span>Total Questions: ${data.length}</span>
          </div>
        </div>
        <div class="space-y-3">
          ${data
            .map(
              (item, index) => `
            <div class="">
              <div class="mb-1 text-base">
                <span class="font-medium">Q.${index + 1}. </span>
                <span>${item.question}</span>
              </div>
               <div class=" text-sm">
                  <span class="font-normal ">Ans.</span>
                   <span>${item.answer}</span>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const loadingBar = document.getElementById("loadingBar");
    submitButton.textContent = "Generating...";
    submitButton.disabled = true;
    loadingBar.classList.remove("hidden");

    try {
      const response = await fetch(
        "https://question-mcq-generate.onrender.com/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Server response:", data);

        resultDiv.classList.remove("hidden");
        resultDiv.className = "max-w-4xl mx-auto mt-8 p-4";

        if (data.result.data.length === 0) {
          questionsList.innerHTML = `
            <div class="bg-yellow-50 text-yellow-600 p-4 rounded-md text-center">
              <p>Please try re-generating.</p>
            </div>
          `;
          resultDiv.classList.remove("hidden");
          downloadButtonContainer.classList.add("hidden");
          return;
        }

        let displayContent = "";
        if (data.result.type === "MCQ") {
          displayContent = displayMCQ(data?.result?.data, data?.result?.type);
        } else if (data.result.type === "Short Question") {
          displayContent = displayShortQuestion(
            data?.result?.data,
            data?.result?.type
          );
        } else if (data.result.type === "Long Question") {
          displayContent = displayLongQuestion(
            data?.result?.data,
            data?.result?.type
          );
        }

        questionsList.innerHTML = displayContent;
        // Show the download button after questions are displayed
        downloadButtonContainer.classList.remove("hidden");
      } else {
        throw new Error("Failed to upload file and generate questions");
      }
    } catch (error) {
      console.error("Error:", error);
      questionsList.innerHTML = `
        <div class="bg-red-50 text-red-600 p-4 rounded-md">
          An error occurred. Please try again.
        </div>
      `;
      resultDiv.classList.remove("hidden");
    } finally {
      submitButton.textContent = "Generate Questions";
      submitButton.disabled = false;
      loadingBar.classList.add("hidden");
    }
  });

  // Add event listener for the download PDF button
  if (downloadPDFButton) {
    downloadPDFButton.addEventListener("click", async () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      var pdf = document.getElementById("questionsList");
      html2canvas(pdf).then((canvas) => {
        let imgData = canvas.toDataURL("image/png");
        let imgWidth = 190;
        let imgHeight = (canvas.height * imgWidth) / canvas.width;

        doc.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
        doc.save("Question.pdf");
      });
    });
  } else {
    console.error("Download PDF button not found in the DOM");
  }
});
