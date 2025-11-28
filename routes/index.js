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
    const parsedData = JSON.parse(jsonString);
    res.render("index", {
      parsedData: parsedData.members,
    });
  });
});

/* GET member page. */
router.get("/member/:id", (req, res, next) => {
  const memberId = req.params.id;
  fs.readFile("./data/clubinfo.json", "utf8", (err, jsonString) => {
    const parsedData = JSON.parse(jsonString);
    const member = parsedData.members.find((m) => m.id == memberId);
    if (!member) {
      console.log("Member not found:", memberId);
      return res.status(404).send("Member not found.");
    }
    res.render("single-member", { parsedData: member });
  });
});

/* GET search by query page. */
router.get("/search", (req, res, next) => {
  const cat = req.query.cat;
  const userSearchTerm = (req.query.memberSearch || "").toLowerCase();
  let filteredMembers = [];
  fs.readFile("./data/clubinfo.json", "utf8", (err, jsonString) => {
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
  });
});

/* GET member registration page. */
router.get("/member-registration", (req, res) => {
  res.render("member-registration");
});

/* POST member registration form data. */
router.post("/member-registration", (req, res, next) => {
  const formData = req.body;
  const filePath = path.join(__dirname, "../data/clubinfo.json");
  fs.readFile(filePath, "utf8", (err, jsonString) => {
    const parsedData = JSON.parse(jsonString);
    let nextId = 1000;
    if (parsedData.members.length > 0) {
      const highestId = Math.max(
        ...parsedData.members.map((m) => Number(m.id) || 0)
      );
      nextId = highestId + 1;
    }
    const newMember = {
      id: nextId,
      name: formData.name,
      team: formData.team,
      age: formData.age,
      gender: formData.gender,
      level: formData.level,
      type: formData.type,
      dow: Array.isArray(formData.dow) ? formData.dow : [formData.dow],
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
    });
    res.redirect("/");
  });
});

module.exports = router;
