var express = require("express");
var router = express.Router();
const fs = require("fs");

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

module.exports = router;
