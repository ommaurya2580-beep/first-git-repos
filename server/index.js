const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/merge', upload.array('pdfs'), async (req, res) => {
    try {
        const pdfDocs = await Promise.all(req.files.map(file => PDFDocument.load(file.buffer)));
        const mergedPdf = await PDFDocument.create();

        for (const pdf of pdfDocs) {
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach(page => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        res.setHeader('Content-Disposition', 'attachment; filename=merged.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        res.send(mergedPdfBytes);
    } catch (error) {
        res.status(500).send('Error merging PDFs: ' + error.message);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
