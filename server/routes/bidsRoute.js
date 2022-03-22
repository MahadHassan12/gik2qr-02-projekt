const router = require("express").Router();
const { result } = require("validate.js");
// const { result } = require("validate.js");
const db = require("../models");
const itemService = require('../services/itemService');

//read
router.get('/:id/items', (req, res) => {});

router.get('/', (req, res) => {
    db.bid.findAll().then((result) => {
        res.send(result);
    });
});

//get
router.post('/', (req, res) => {
    const bid = req.body;
    db.bid.create(bid).then((result) => {
        res.send(result);
    });
});

router.put('/', (req, res) => {
    const bid = req.body
    const id = bid.id;
    db.bid
        .update(bid, {
            where: { id: bid.id }
        })
        .then(() => {
            res.json(`Budet har uppdaterats.`)
        });
});

router.delete('/', (req, res) => {
    db.bid
        .destroy({
            where: { id: req.body.id }
        })
        .then(() => {
            res.json(`Budet raderades`)
        });
});

module.exports = router;