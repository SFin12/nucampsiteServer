const express = require("express");
const favoriteRouter = express.Router();
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");

favoriteRouter
    .route("/")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate("user campsites")
            .then((campsites) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(campsites);
            })
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite) {
                    req.body.forEach((campsite) => {
                        if (!favorite.campsites.includes(campsite._id)) {
                            favorite.campsites.push(campsite);
                        }
                    });
                    favorite.save().then((savedFavorite) => {
                        res.json(savedFavorite);
                    });
                } else {
                    Favorite.create({
                        user: req.user._id,
                        campsites: req.body,
                    }).then((createdFavorite) => {
                        res.json(createdFavorite);
                    });
                }
            })
            .catch((err) => next(err));
    })
    .put(
        cors.corsWithOptions,
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        (req, res) => {
            res.statusCode = 403;
            res.end(`PUT operation not supported`);
        }
    )
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
            .then((foundFavorite) => {
                if (foundFavorite) {
                    res.json(foundFavorite);
                } else {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "text/plain");
                    res.end("You do not have any favorites to delete");
                }
            })
            .catch((err) => next(err));
    });

favoriteRouter
    .route("/:campsiteId")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Favorite.findById(req.params.campsiteId);
        res.statusCode = 403;
        res.end(`GET operation not supported`);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        Favorite.findOne({ user: req.body._id })
            .then((favorites) => {
                if (favorites) {
                    if (!favorites.campsites.includes(req.params.campsiteId)) {
                        favorites.campsites.push({
                            _id: req.params.campsiteId,
                        });
                    } else {
                        res.status = 200;
                        res.setHeader("Content-Type", "text/plain");
                        res.end(
                            "That campsite is already in the list of favorites!"
                        );
                    }
                } else {
                    Favorite.create({
                        user: req.user._id,
                        campsites: [{ _id: req.params.campsiteId }],
                    }).then((createdFavorite) => {
                        res.json(createdFavorite);
                    });
                }
            })
            .catch((err) => next(err));
    })
    .put(
        cors.corsWithOptions,
        authenticate.verifyUser,
        authenticate.verifyAdmin,
        (req, res, next) => {
            res.statusCode = 403;
            res.end(`PUT operation not supported`);
        }
    )
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite) {
                    favorite.campsites.splice(
                        favorite.campsites.indexOf(req.params.campsiteId),
                        1
                    );

                    favorite.save().then((savedFavorite) => {
                        res.json(savedFavorite);
                    });
                } else {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "text/plain");
                    res.end("You do not have any favorites to delete");
                }
            })
            .catch((err) => next(err));
    });

module.exports = favoriteRouter;
