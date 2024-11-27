const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(bodyParser.json());

// Set up multer for file uploads
const upload = multer({ dest: "uploads/" });

// Gmail transporter setup using environment variables
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Route to send email
app.post("/send-email", upload.single("htmlContent"), async (req, res) => {
  const { to, subject } = req.body;
  const htmlFile = req.file;

  if (!to || !subject || !htmlFile) {
    return res.status(400).send({
      error: "All fields (to, subject, htmlContent file) are required!",
    });
  }

  try {
    // Read HTML content from the uploaded file
    const htmlContent = fs.readFileSync(htmlFile.path, "utf8");

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      html: htmlContent, // Use the HTML content from the file
    };

    const info = await transporter.sendMail(mailOptions);

    // Clean up the uploaded file after sending email
    fs.unlinkSync(htmlFile.path);

    res.status(200).send({
      message: "Email sent successfully!",
      info,
    });
  } catch (error) {
    res.status(500).send({
      error: "Failed to send email!",
      details: error.message,
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
