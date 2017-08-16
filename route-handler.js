var db = require('./db/config');
var User = require('./db/models/users');
var Ingredient = require('./db/models/ingredients');

//ingredient search api route
exports.ingredients = function(req, res) {
  var ingredient = req.body.data.ingredient;
  var userID = req.body.data.userID;

  Ingredient.findOne({name: ingredient})
    .exec(function(err, ingredientName) {
      //if there is an ingredient, return the document JSON, on the front end, we can extrapolate the name and link!
      if (!ingredientName) {
        res.status(401).send(`${ingredient} not in database`);
      } else {
        User.findByIdAndUpdate(userID, {"$push": {"pastSearches": ingredientName.name}})
          .exec(function(err, user) {
            if (err) {
              throw err;
            } else {
              console.log(user);
            }
          })

        res.json(ingredientName);
      }
    });
};

//get past searches api route
exports.pastSearches = function(req, res) {
  var userID = req.body.data.userID;

  User.findOne({_id: userID})
    .exec(function (err, user) {
      if (!user) {
        res.status(401).send('user not found in database');
      } else {
        res.send(user.pastSearches);
      }
    })
}
