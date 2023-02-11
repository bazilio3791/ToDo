//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require("lodash");
const app = express();

const PORT = process.env.PORT || 27017;
const day = date.getDate();


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://Svarog3791:1234rewq@cluster0.jgum4va.mongodb.net/todolistDB', { useNewUrlParser: true });

const itemsSchema = {
  name: String
};

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: 'Write a new item in the "New Item" field'
});
const item2 = new Item({
  name: 'Hit "+" for adding the item to the list'
});
const item3 = new Item({
  name: 'Hit to the left small box for deleting the item'
});
const defaultfList = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model('List', listSchema);


app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultfList, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          // console.log('Items inserted');
        }
      });
      res.redirect('/');
    } else {
      res.render("list", { listTitle: 'Today', newListItems: foundItems });
    }
  });

});

app.get('/:usersNewList', function (req, res) {
  const usersNewList = _.capitalize(req.params.usersNewList);
  List.findOne({ name: usersNewList }, function (err, foundItems) {
    if (!err) {
      if (!foundItems) {
        // console.log('Doesn`t exist');
        const list = new List({
          name: usersNewList,
          items: defaultfList
        });
        list.save();
        res.redirect('/' + usersNewList);
      } else {
        // console.log('Exist');
        res.render('list', { listTitle: foundItems.name, newListItems: foundItems.items });
      }
    }

  });
});


app.post("/", function (req, res) {

  const addedItem = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: addedItem
  });

  if (listName === 'Today') {
    // console.log(listName + ' Not exist');
    item.save();
    res.redirect('/');
  }
  else {
    // console.log(listName + ' Exist');
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      // console.log(listName);
      res.redirect('/' + listName);
    });
  }
});


app.post('/delete', function (req, res) {
  const checkedItemId = req.body.checkbox.trim();
  const listName = req.body.listName;
  // console.log(listName);

  if (listName === 'Today') {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        // console.log(checkedItemId + " Successfully deleted");
        res.redirect("/");
      }
      else {
        console.log('error', err);
      }
    });
  }
  else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
      if (!err) {
        // console.log(listName);
        res.redirect('/' + listName);
      }
    });
  }

});

// app.get("/work", function (req, res) {
//   Item.find({}, function (err, foundItems) {
//     res.render("list", { listTitle: "Work List", newListItems: foundItems });
//   });
// });

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(PORT, function () {
  console.log(`Server started on port ${PORT}...`);
});
