var express = require("express");
var router = express.Router();
const fs = require("fs");
const path = require("path");

const imageBaseUrl = "https://loremflickr.com/300/450/letter";

router.use((req, res, next) => {
  res.locals.imageBaseUrl = imageBaseUrl;
  next();
});

/* GET home page. */
router.get("/", function (req, res, next) {
  fs.readFile("./data/clubinfo.json", "utf8", (err, jsonString) => {
    if (err) {
      console.error("Error reading clubinfo.json:", err);
      return res.status(500).send("Internal Server Error");
    }
    try {
      const parsedData = JSON.parse(jsonString);
      res.render("index", {
        parsedData: parsedData.members,
      });
    } catch (parseErr) {
      console.error("Error parsing JSON:", parseErr);
      return res.status(500).send("Internal Server Error");
    }
  });
});

/* GET member page. */
router.get("/member/:id", (req, res, next) => {
  const memberId = req.params.id;
  fs.readFile("./data/clubinfo.json", "utf8", (err, jsonString) => {
    if (err) {
      console.error("Error reading clubinfo.json:", err);
      return res.status(500).send("Internal Server Error");
    }
    try {
      const parsedData = JSON.parse(jsonString);
      const member = parsedData.members.find((m) => m.id == memberId);
      if (!member) {
        console.log("Member not found:", memberId);
        return res.status(404).send("Member not found.");
      }
      res.render("single-member", { parsedData: member });
    } catch (parseErr) {
      console.error("Error parsing JSON:", parseErr);
      return res.status(500).send("Internal Server Error");
    }
  });
});

/* DELETE member page. */
router.delete("/member/:id", (req, res) => {
  const memberId = parseInt(req.params.id, 10);
  const filePath = path.join(__dirname, "../data/clubinfo.json");

  fs.readFile(filePath, "utf8", (err, jsonString) => {
    if (err) {
      console.error("Error reading clubinfo.json:", err);
      return res.status(500).send("Internal Server Error");
    }
    try {
      const parsedData = JSON.parse(jsonString);
      const updatedMembers = parsedData.members.filter(
        (m) => m.id !== memberId
      );
      if (updatedMembers.length === parsedData.members.length) {
        return res.status(404).send("Member not found.");
      }
      parsedData.members = updatedMembers;
      fs.writeFile(filePath, JSON.stringify(parsedData, null, 2), (err) => {
        if (err) {
          console.error("Error writing clubinfo.json:", err);
          return res.status(500).send("Internal Server Error");
        }
        res.json({ success: true });
      });
    } catch (parseErr) {
      console.error("JSON Parse Error:", parseErr);
      res.status(500).send("Internal Server Error");
    }
  });
});

/* GET search by query page. */
router.get("/search", (req, res, next) => {
  const cat = req.query.cat;
  const userSearchTerm = (req.query.memberSearch || "").toLowerCase();
  let filteredMembers = [];

  if (userSearchTerm.trim() !== "") {
    fs.readFile("./data/clubinfo.json", "utf8", (err, jsonString) => {
      if (err) {
        console.error("Error reading clubinfo.json:", err);
        return res.status(500).send("Internal Server Error");
      }
      try {
        const parsedData = JSON.parse(jsonString);
        if (cat === "player") {
          filteredMembers = parsedData.members.filter((member) =>
            member.name.toLowerCase().includes(userSearchTerm)
          );
        } else if (cat === "team") {
          filteredMembers = parsedData.members.filter((member) =>
            member.team.toLowerCase().includes(userSearchTerm)
          );
        }
        res.render("index", {
          parsedData: filteredMembers,
        });
      } catch (parseErr) {
        console.error("Error parsing JSON:", parseErr);
        return res.status(500).send("Internal Server Error");
      }
    });
  } else {
    // If search term is empty, render with empty results
    res.render("index", {
      parsedData: filteredMembers,
    });
  }
});

/* GET member registration page. */
router.get("/member-registration", (req, res) => {
  res.render("member-registration", { errors: {}, formData: {} });
});

/* POST member registration form data. */
router.post("/member-registration", (req, res, next) => {
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
  const filePath = path.join(__dirname, "../data/clubinfo.json");
  fs.readFile(filePath, "utf8", (err, jsonString) => {
    if (err) {
      console.error("Error reading clubinfo.json:", err);
      return res.status(500).send("Internal Server Error");
    }

    let parsedData;
    try {
      parsedData = JSON.parse(jsonString);
    } catch (parseErr) {
      console.error("Error parsing JSON:", parseErr);
      return res.status(500).send("Internal Server Error");
    }
    let nextId = 1000;
    if (parsedData.members.length > 0) {
      const highestId = Math.max(
        ...parsedData.members.map((m) => Number(m.id) || 0)
      );
      nextId = highestId + 1;
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
      memberHistory:
        formData.memberHistory
          ?.split("\n")
          .map((line) => line.trim())
          .filter((line) => line) || [],
    };

    parsedData.members.push(newMember);

    fs.writeFile(filePath, JSON.stringify(parsedData, null, 2), (err) => {
      if (err) {
        console.error("Error writing clubinfo.json:", err);
        return res.status(500).send("Internal Server Error");
      }
      res.redirect(`/member/${newMember.id}`);
    });
  });
});

module.exports = router;
