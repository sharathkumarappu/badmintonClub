var express = require("express");
var router = express.Router();
const connectDB = require('./db');

const imageBaseUrl = "https://loremflickr.com/300/450/letter";

router.use((req, res, next) => {
  res.locals.imageBaseUrl = imageBaseUrl;
  next();
});

/* GET home page. */
router.get("/", async function (req, res, next) {
  try {
    const db = await connectDB();
    const members = await db.collection('member_info').find().toArray();
    res.render("index", {
      parsedData: members,
    });
  } catch (err) {
    console.error("Error fetching members:", err);
    return res.status(500).send("Internal Server Error");
  }
});

/* GET members page. */
router.get("/members", async function (req, res, next) {
  try {
    const db = await connectDB();
    const members = await db.collection('member_info').find().toArray();
    res.render("members", {
      parsedData: members,
    });
  } catch (err) {
    console.error("Error fetching members:", err);
    return res.status(500).send("Internal Server Error");
  }
});

/* GET attendance page. */
router.get("/attendance", async function (req, res, next) {
  try {
    const db = await connectDB();
    const members = await db.collection('member_info').find().toArray();
    const savedCount = Number.parseInt(req.query.saved, 10);
    res.render("attendance", {
      parsedData: members,
      savedCount: Number.isNaN(savedCount) ? null : savedCount,
    });
  } catch (err) {
    console.error("Error fetching members:", err);
    return res.status(500).send("Internal Server Error");
  }
});

/* GET member page. */
router.get("/member/:id", async (req, res, next) => {
  const memberId = parseInt(req.params.id, 10);
  try {
    const db = await connectDB();
    const member = await db.collection('member_info').findOne({ id: memberId });
    if (!member) {
      console.log("Member not found:", memberId);
      return res.status(404).send("Member not found.");
    }
    res.render("single-member", { parsedData: member });
  } catch (err) {
    console.error("Error fetching member:", err);
    return res.status(500).send("Internal Server Error");
  }
});

/* DELETE member page. */
router.delete("/member/:id", async (req, res) => {
  const memberId = parseInt(req.params.id, 10);
  try {
    const db = await connectDB();
    const result = await db.collection('member_info').deleteOne({ id: memberId });
    if (result.deletedCount === 0) {
      return res.status(404).send("Member not found.");
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting member:", err);
    return res.status(500).send("Internal Server Error");
  }
});

/* GET search by query page. */
router.get("/search", async (req, res, next) => {
  const cat = req.query.cat;
  const userSearchTerm = (req.query.memberSearch || "").toLowerCase();
  let filteredMembers = [];

  if (userSearchTerm.trim() !== "") {
    try {
      const db = await connectDB();
      const members = await db.collection('member_info').find().toArray();
      if (cat === "player") {
        filteredMembers = members.filter((member) =>
          member.name.toLowerCase().includes(userSearchTerm)
        );
      } else if (cat === "team") {
        filteredMembers = members.filter((member) =>
          member.team.toLowerCase().includes(userSearchTerm)
        );
      }
      res.render("members", {
        parsedData: filteredMembers,
      });
    } catch (err) {
      console.error("Error searching members:", err);
      return res.status(500).send("Internal Server Error");
    }
  } else {
    // If search term is empty, render with empty results
    res.render("members", {
      parsedData: filteredMembers,
    });
  }
});

/* GET member registration page. */
router.get("/member-registration", (req, res) => {
  res.render("member-registration", { errors: {}, formData: {} });
});

/* POST member registration form data. */
router.post("/member-registration", async (req, res, next) => {
  const formData = req.body;
  const errors = {};
  if (!formData.name || formData.name.trim() === "") {
    errors.name = "Name is required";
  }
  if (!formData.age || formData.age <= 0 || isNaN(formData.age)) {
    errors.age = "Age is required and must be a valid positive number";
  }
  const validTeams = ["RED", "BLUE", "GREEN"];
  if (formData.team && !validTeams.includes(formData.team)) {
    errors.team = "Team must be one of: RED, BLUE, or GREEN";
  }
  const validGenders = ["Male", "Female", "Others"];
  if (!formData.gender || !validGenders.includes(formData.gender)) {
    errors.gender = "Gender must be one of: Male, Female, or Others";
  }
  const validLevels = ["Beginner", "Intermediate", "Expert"];
  if (!formData.level || !validLevels.includes(formData.level)) {
    errors.level = "Level must be one of: Beginner, Intermediate, or Expert";
  }
  const validTypes = ["feather shuttle", "nylon shuttle"];
  if (!formData.type || !validTypes.includes(formData.type)) {
    errors.type = "Type must be one of: Feather Shuttle or Nylon Shuttle";
  }
  const validDays = ["Tuesday", "Friday"];
  let daysOfWeek = [];

  if (Array.isArray(formData.dow)) {
    daysOfWeek = formData.dow;
  } else if (formData.dow) {
    daysOfWeek = formData.dow
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d);
  }

  const invalidDays = daysOfWeek.filter((day) => !validDays.includes(day));
  if (daysOfWeek.length === 0) {
    errors.dow = "At least one day of the week must be selected";
  } else if (invalidDays.length > 0) {
    errors.dow = "Days must be either Tuesday, Friday, or both";
  }
  if (!formData.registration_date || formData.registration_date === "") {
    errors.registration_date = "Registration date is required";
  }

  // If there are validation errors, re-render the form with error messages
  if (Object.keys(errors).length > 0) {
    console.log("Validation errors:", errors);
    return res
      .status(400)
      .render("member-registration", { errors: errors, formData: formData });
  }

  // If validation passes, save the member
  try {
    const db = await connectDB();
    const maxMember = await db.collection('member_info').find().sort({ id: -1 }).limit(1).toArray();
    let nextId = 1000;
    if (maxMember.length > 0) {
      nextId = maxMember[0].id + 1;
    }

    const newMember = {
      id: nextId,
      name: formData.name.trim(),
      team: formData.team || null,
      age: formData.age,
      gender: formData.gender,
      level: formData.level,
      type: formData.type,
      dow: daysOfWeek,
      registration_date: formData.registration_date,
      attendance: [],
      memberHistory:
        formData.memberHistory
          ?.split("\n")
          .map((line) => line.trim())
          .filter((line) => line) || [],
    };

    await db.collection('member_info').insertOne(newMember);
    res.redirect(`/member/${newMember.id}`);
  } catch (err) {
    console.error("Error saving member:", err);
    return res.status(500).send("Internal Server Error");
  }
});

/* POST attendance data. */
router.post("/attendance", async (req, res) => {
  const selectedDate = req.body.selectedDate;
  const attendanceData = req.body.attendance;

  if (!selectedDate || typeof selectedDate !== "string") {
    return res.redirect("/attendance");
  }

  const normalizeSelected = (value) =>
    value === "present" || value === "on" || value === true || value === "true";

  const selectedFromNestedAttendance =
    attendanceData && typeof attendanceData === "object" && !Array.isArray(attendanceData)
      ? Object.keys(attendanceData).filter((memberId) =>
          normalizeSelected(attendanceData[memberId])
        )
      : [];

  const selectedFromBracketKeys = Object.keys(req.body)
    .filter((key) => key.startsWith("attendance[") && normalizeSelected(req.body[key]))
    .map((key) => key.replace("attendance[", "").replace("]", ""));

  const selectedMemberIds = [...selectedFromNestedAttendance, ...selectedFromBracketKeys];

  const uniqueSelectedMemberIds = [...new Set(selectedMemberIds)];

  try {
    const db = await connectDB();
    let savedCount = 0;
    for (const memberId of uniqueSelectedMemberIds) {
      const member = await db.collection('member_info').findOne({ id: parseInt(memberId, 10) });
      if (member) {
        const attendanceList = Array.isArray(member.attendance) ? [...member.attendance] : [];
        if (!attendanceList.includes(selectedDate)) {
          attendanceList.push(selectedDate);
          await db.collection('member_info').updateOne({ id: parseInt(memberId, 10) }, { $set: { attendance: attendanceList } });
          savedCount++;
        }
      }
    }
    // For absent members, remove the date if present
    const allMembers = await db.collection('member_info').find().toArray();
    for (const member of allMembers) {
      if (!uniqueSelectedMemberIds.includes(String(member.id))) {
        const attendanceList = Array.isArray(member.attendance) ? [...member.attendance] : [];
        const dateIndex = attendanceList.indexOf(selectedDate);
        if (dateIndex !== -1) {
          attendanceList.splice(dateIndex, 1);
          await db.collection('member_info').updateOne({ id: member.id }, { $set: { attendance: attendanceList } });
        }
      }
    }
    return res.redirect(`/attendance?saved=${savedCount}`);
  } catch (err) {
    console.error("Error updating attendance:", err);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
