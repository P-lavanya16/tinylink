async function shortenURL() {
  const input = document.getElementById("urlInput").value;
  const resultBox = document.getElementById("result");

  if (!input) {
    resultBox.innerText = "Please enter a URL";
    return;
  }

  const res = await fetch("/api/shorten", {
    method: "POST",
    body: JSON.stringify({ url: input })
  });

  const data = await res.json();

  if (data.error) {
    resultBox.innerText = data.error;
  } else {
    resultBox.innerHTML =
      `Short URL: <a href="${data.shortUrl}" target="_blank">${data.shortUrl}</a>`;
  }
}
