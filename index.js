const path = require("path");
const express = require("express");
const fs = require("fs");
const app = express();

const htmlFilePath = path.join(__dirname, "./dist/index.html");

const endpoints = {
  fetchMessages: `https://weddingjs.avltree9798-uk.workers.dev/messages`,
  fetchGuestBook: `https://weddingjs.avltree9798-uk.workers.dev/guestbook`,
  fetchUsers: `https://weddingjs.avltree9798-uk.workers.dev/users`,
  fetchTextContent: `https://weddingjs.avltree9798-uk.workers.dev/content`,
  fetchPhotos: `https://weddingjs.avltree9798-uk.workers.dev/photos`,
};

// Middleware to alter the meta tag and title in the HTML file
app.use(async (req, res, next) => {
  if (req.path === "/" || req.path.endsWith(".html")) {
    console.log(req.query.userId);
    fs.readFile(htmlFilePath, "utf8", async (err, data) => {
      if (err) {
        console.error("Error reading HTML file:", err);
        return res.status(500).send("Internal Server Error");
      }

      const resp = await fetch(
        "https://weddingjs.avltree9798-uk.workers.dev/content/6cd3e8ae-3d78-4ed1-b81b-a4b99bf29a72"
      );
      const guestResp = await fetch(
        `${endpoints.fetchUsers}/${req.query.userId}`,
        {
          method: "GET",
        }
      );
      const photoResp = await fetch(
        `${endpoints.fetchPhotos}/${req.query.userId}`,
        {
          method: "GET",
        }
      );

      const respData = await resp.json();
      const guestData = await guestResp.json();
      const photoData = await photoResp.json();

      // Modify the meta tag and title in the HTML content

      let modifiedHtml = data.replace(
        /__PLACEHOLDER_FOR_DYNAMIC_META_TAG__/,
        `<meta name="description" content="New Description">
        <meta name="title" content="The wedding of Anthony & Leonie - Inviteyou" />
        <meta name="description" content="Digital invitation for the wedding of Anthony & Leonie Madeleine for ${guestData.name}" />
        <meta property="og:image" content=${photoData.main_photo} data-rh="true">
        `
      );

      modifiedHtml = modifiedHtml.replace(
        /<title>[^<]*<\/title>/,
        `<title>The wedding of ${respData.groom_first_name} and ${respData.bride_first_name} - Ivitation</title>`
      );

      res.send(modifiedHtml);
    });
  } else {
    next();
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, "./dist")));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
