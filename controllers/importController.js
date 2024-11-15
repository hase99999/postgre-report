const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const csv = require('csv-parser');
const xml2js = require('xml2js');
const prisma = new PrismaClient();

exports.importJson = async (req, res) => {
  try {
    const ptinfos = Array.isArray(req.body) ? req.body : [req.body];
    for (const ptinfo of ptinfos) {
      const bith = ptinfo.bith && ptinfo.bith !== "0000-00-00T00:00:00Z" ? new Date(ptinfo.bith) : null;
      try {
        await prisma.ptinfo.create({
          data: {
            ptnumber: BigInt(ptinfo.ptnumber),
            ptname: ptinfo.ptname,
            ptage: ptinfo.ptage,
            bith: bith,
            sex: ptinfo.sex,
          },
        });
      } catch (err) {
        if (err.code === 'P2002') {
          await prisma.ptinfo.update({
            where: { ptnumber: BigInt(ptinfo.ptnumber) },
            data: {
              ptname: ptinfo.ptname,
              ptage: ptinfo.ptage,
              bith: bith,
              sex: ptinfo.sex,
            },
          });
        } else {
          throw err;
        }
      }
    }
    res.status(200).json({ message: 'Data imported successfully' });
  } catch (err) {
    console.error('Error importing JSON data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.importCsv = async (req, res) => {
  try {
    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        Object.keys(data).forEach(key => {
          data[key] = data[key].replace(/\r/g, '').trim();
        });
        results.push(data);
      })
      .on('end', async () => {
        const batchSize = 1000;
        for (let i = 0; i < results.length; i += batchSize) {
          const batch = results.slice(i, i + batchSize);
          try {
            await prisma.ptinfo.createMany({
              data: batch.map(ptinfo => ({
                ptnumber: BigInt(ptinfo.ptnumber),
                ptname: ptinfo.ptname,
                ptage: parseInt(ptinfo.ptage),
                bith: ptinfo.bith && ptinfo.bith !== "0000-00-00T00:00:00Z" ? new Date(ptinfo.bith) : null,
                sex: ptinfo.sex,
              })),
              skipDuplicates: true,
            });
          } catch (err) {
            console.error('Error importing batch:', err);
            throw err;
          }
        }
        fs.unlinkSync(req.file.path);
        res.status(200).json({ message: 'Data imported successfully' });
      });
  } catch (err) {
    console.error('Error importing CSV data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.importXml = async (req, res) => {
  try {
    const xmlData = fs.readFileSync(req.file.path, 'utf8');
    xml2js.parseString(xmlData, async (err, result) => {
      if (err) {
        console.error('Error parsing XML data:', err);
        return res.status(500).json({ error: 'Error parsing XML data' });
      }

      const reports = result.root.Reports; // XMLの構造に応じて調整
      if (!reports) {
        console.error('No reports found in XML data');
        return res.status(400).json({ error: 'No reports found in XML data' });
      }

      const batchSize = 1000;
      for (let i = 0; i < reports.length; i += batchSize) {
        const batch = reports.slice(i, i + batchSize);
        try {
          await prisma.report.createMany({
            data: batch.map(report => ({
              examdate: report.examdate && report.examdate[0] !== "0000-00-00T00:00:00Z" ? new Date(report.examdate[0]) : null,
              ptnumber: BigInt(report.ptnumber[0]),
              modality: report.modality[0],
              docor: report.docor[0],
              department: report.department[0],
              clinicaldiag: report.clinicaldiag[0],
              imagediag: report.imagediag[0],
              report: report.report[0],
              finaldiag: report.finaldiag[0],
              interesting: report.interesting[0],
              inputby: report.inputby[0],
              inputdate: report.inputdate && report.inputdate[0] !== "0000-00-00T00:00:00Z" ? new Date(report.inputdate[0]) : null,
              site: report.site[0],
              inputtime: report.inputtime && report.inputtime[0] !== "0000-00-00T00:00:00Z" ? new Date(report.inputtime[0]) : null,
              examdetail: report.examdetail[0],
              dicomid: report.dicomid[0],
              pspnumber: report.pspnumber[0],
            })),
            skipDuplicates: true,
          });
        } catch (err) {
          console.error('Error importing batch:', err);
          throw err;
        }
      }
      fs.unlinkSync(req.file.path);
      res.status(200).json({ message: 'Data imported successfully' });
    });
  } catch (err) {
    console.error('Error importing XML data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};