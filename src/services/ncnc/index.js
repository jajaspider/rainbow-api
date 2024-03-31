const _ = require("lodash");
const axios = require("axios");

const DB = require("../../models"),
  Category = DB.NCNCCategory,
  Brand = DB.NCNCBrand,
  Item = DB.NCNCItem;
const { RainbowError, ERROR_CODE } = require("../../core/constants");
const utils = require("../../utils");

async function updateCategory() {
  let result = await axios.get(`https://api2.ncnc.app/con-category1s`);
  let resultData = _.get(result, "data.conCategory1s", []);

  for (let _category of resultData) {
    let categoryObj = {
      name: _category.name,
      id: _category.id,
    };
    await Category.findOneAndUpdate({ name: _category.name }, categoryObj, {
      upsert: true,
      new: true,
    });
  }

  return resultData;
}

async function getCategory() {
  let category = await Category.find({});
  category = utils.toJSON(category);

  return category;
}

async function updateBrand() {
  let categories = await getCategory();
  for (let _category of categories) {
    let result = await axios.get(
      `https://api2.ncnc.app/con-category2s?conCategory1Id=${_category.id}&forSeller=1`
    );
    let brands = _.get(result, "data.conCategory2s", []);
    for (let _brand of brands) {
      let brandObj = {
        name: _brand.name,
        id: _brand.id,
        categoryId: _brand.conCategory1Id,
      };
      await Brand.findOneAndUpdate({ name: _brand.name }, brandObj, {
        upsert: true,
        new: true,
      });
    }
  }
}

async function getBrand() {
  let brand = await Brand.find({});
  brand = utils.toJSON(brand);

  return brand;
}

async function updateItem() {
  let brands = await getBrand();
  for (let _brand of brands) {
    let result = await axios.get(
      `https://api2.ncnc.app/con-items?conCategory2Id=${_brand.id}&forSeller=1`
    );
    let items = _.get(result, "data.conItems", []);
    for (let _item of items) {
      let itemObj = {
        name: _item.name,
        id: _item.id,
        brandName: _brand.name,
        brandId: _brand.id,
      };
      await Item.findOneAndUpdate(
        { brandName: _brand.name, name: _item.name },
        itemObj,
        {
          upsert: true,
          new: true,
        }
      );
    }

    await utils.sleep(300);
  }
}

async function getItemById(id) {
  let targetItems = await Item.findOne({ id: id });
  targetItems = utils.toJSON(targetItems);

  return targetItems;
}

async function getItemByName(name) {
  const nameRegex = new RegExp(`${name}`, "i");
  let targetItems = await Item.find({ name: nameRegex });
  targetItems = utils.toJSON(targetItems);

  return targetItems;
}

async function getItemStatus(brandId, itemId) {
  brandId = Number(brandId);
  itemId = Number(itemId);
  let result = await axios.get(
    `https://api2.ncnc.app/con-items?conCategory2Id=${brandId}&forSeller=1`
  );
  let resultData = _.get(result, "data.conItems");
  let targetItem = _.find(resultData, { id: itemId });
  if (_.isEmpty(targetItem)) {
    return null;
  }

  return targetItem;
}

module.exports = {
  updateCategory,
  getCategory,
  updateBrand,
  getBrand,
  getItemByName,
  getItemById,
  getItemStatus,
};
