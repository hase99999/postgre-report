const { PrismaClient } = require("@prisma/client");
const express = require("express");
const app = express();
const PORT = 5000;
const prisma = new PrismaClient();

app.use(express.json());

// Reports endpoints
app.get("/reports", async (req, res) => {
  try {
    const reports = await prisma.report.findMany();
    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/reports/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    console.log(`Invalid ID received: ${req.params.id}`);
    return res.status(400).json({ error: "Invalid ID" });
  }
  try {
    const report = await prisma.report.findUnique({
      where: { id },
    });
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.json(report);
  } catch (error) {
    console.error(`Error fetching report with ID ${id}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/reports", async (req, res) => {
  const {
    examdate,
    ptnumber,
    modality,
    doctor,
    department,
    clinicaldiag,
    imagediag,
    report,
    finaldiag,
    interesting,
    inputby,
    inputdate,
    site,
    inputtime,
  } = req.body;

  try {
    const newReport = await prisma.report.create({
      data: {
        examdate,
        ptnumber,
        modality,
        doctor,
        department,
        clinicaldiag,
        imagediag,
        report,
        finaldiag,
        interesting,
        inputby,
        inputdate,
        site,
        inputtime,
      },
    });
    res.json(newReport);
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Doctor endpoints
app.get("/doctors", async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany();
    res.json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/doctors/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    console.log(`Invalid ID received: ${req.params.id}`);
    return res.status(400).json({ error: "Invalid ID" });
  }
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
    });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    res.json(doctor);
  } catch (error) {
    console.error(`Error fetching doctor with ID ${id}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/doctors", async (req, res) => {
  const { name, specialty, contact } = req.body;
  try {
    const newDoctor = await prisma.doctor.create({
      data: { name, specialty, contact },
    });
    res.json(newDoctor);
  } catch (error) {
    console.error("Error creating doctor:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Ptinfo endpoints
app.get("/ptinfos", async (req, res) => {
  try {
    const ptinfos = await prisma.ptinfo.findMany();
    res.json(ptinfos);
  } catch (error) {
    console.error("Error fetching ptinfos:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/ptinfos/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    console.log(`Invalid ID received: ${req.params.id}`);
    return res.status(400).json({ error: "Invalid ID" });
  }
  try {
    const ptinfo = await prisma.ptinfo.findUnique({
      where: { id },
    });
    if (!ptinfo) {
      return res.status(404).json({ error: "Ptinfo not found" });
    }
    res.json(ptinfo);
  } catch (error) {
    console.error(`Error fetching ptinfo with ID ${id}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/ptinfos", async (req, res) => {
  const { name, age, gender, contact } = req.body;
  try {
    const newPtinfo = await prisma.ptinfo.create({
      data: { name, age, gender, contact },
    });
    res.json(newPtinfo);
  } catch (error) {
    console.error("Error creating ptinfo:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Schedule endpoints
app.get("/schedules", async (req, res) => {
  try {
    const schedules = await prisma.schedule.findMany();
    res.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/schedules/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    console.log(`Invalid ID received: ${req.params.id}`);
    return res.status(400).json({ error: "Invalid ID" });
  }
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id },
    });
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    res.json(schedule);
  } catch (error) {
    console.error(`Error fetching schedule with ID ${id}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/schedules", async (req, res) => {
  const { doctorId, ptinfoId, date, time } = req.body;
  try {
    const newSchedule = await prisma.schedule.create({
      data: { doctorId, ptinfoId, date, time },
    });
    res.json(newSchedule);
  } catch (error) {
    console.error("Error creating schedule:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});