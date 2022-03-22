const db = require('../models');
const {
    createResponseSuccess,
    createResponseError,
    createResponseMessage
} = require('../helpers/reponseHelper');
const validate = require('validate.js');
const { result } = require('validate.js');

const constraints = {
    title: {
        length: {
            minimum: 2,
            maximum: 100,
            tooShort: '^Beskrivning av produkt måste vara minst ${count} tecken lång',
            tooLong: '^Beskrivningfår inte vara längre än ${count} tecken lång'
        }
    },
    price: {
        length: {
            minimum: 1.00,
            tooShort: '^Priset måste vara minst ${count} kr',
        }
    }
};

async function getByAuthor(userId) {
    try{
        const user = await db.user.findOne({ where: { id: userId }});
        const allItems = await user.getItems({ include: [db.user, { model: db.bid, include: [db.user] }]});
        return createResponseSuccess(allItems.map((item) => _formatItem(item)));
    } catch(error) {
        return createResponseError(error.status, error.message);
    }
}


async function getByLatestBid(id) {

    try {
        const latestBid = await db.bid.findAll({
            where: { itemId: id },
            order: [
                ["timestamp", "DESC"]
            ]

        });

        return createResponseSuccess(latestBid[0]);
    } catch (error) {
        return createResponseError(error.status, { error: error.message, stack: error.stack });
    }
}


async function getById(id) {
    try {
        const item = await db.item.findOne({
            where: { id },
            include: [db.user, { model: db.bid, include: [db.user] }]
        });
        return createResponseSuccess(_formatItem(item));
    } catch (error) {
        return createResponseError(error.status, error.message);
    }
}

async function getAll() {
    try {
        const allItems = await db.item.findAll({ include: [db.user, { model: db.bid, include: [db.user] }] });
        return createResponseSuccess(allItems.map((item) => _formatItem(item)));
    } catch (error) {
        return createResponseError(error.status, error.message);
    }
}

async function addBid(id, bid) {
    if (!id) {
      return createResponseError(422, 'Id är obligatoriskt');
    }
    try {
      bid.itemId = id;
      await db.bid.create(bid);
  
      const itemWithNewBid = await db.item.findOne({
        where: { id },
        include: [
          db.user,
          {
            model: db.bid,
            include: [db.user]
          }
        ]
      });
  
      return createResponseSuccess(_formatItem(itemWithNewBid));
    } catch (error) {
      return createResponseError(error.status, error.message);
    }
  }

async function create(item) {
    const InvalidData = validate(item, constraints);
    if (InvalidData) {
        return createResponseError(422, InvalidData);
    }
    try {
        const newItem = await db.item.create(item);
        return createResponseSuccess(newItem);
    } catch (error) {
        return createResponseError(error.status, error.message)
    }
};


async function update(item, id) {
    const InvalidData = validate(item, constraints);
    if (!id) {
        return createResponseError(422, 'Id är obligatorisk');
    }
    if (InvalidData) {
        return createResponseError(422, InvalidData);
    }
    try {
        await db.item
            .update(item, {
                where: { id }
            });
        return createResponseMessage(200, 'Auktionen uppdaterades.');
    } catch (error) {
        return createResponseError(error.status, error.message);
    }
};
async function destroy(id) {
    if (!id) {
        return createResponseError(422, 'Id är obligatorsikt.')
    }
    try {
        await db.item
            .destroy({
                where: { id }
            });
        return createResponseMessage(200, 'Auktionen raderades.');
    } catch (error) {
        return createResponseError(error.status, error.message);
    }
};

function _formatItem(item) {

    const cleanItem = {
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        user: {
            id: item.user.id,
            email: item.user.email,
            firstName: item.user.firstName,
            lastName: item.user.lastName,
            password: item.user.password
        },
    };

    if (item.bids) {
        cleanItem.bids = [];
        item.bids.map((bid) => {
            return (cleanItem.bids = [{
                    amount: bid.amount,
                    timestamp: bid.timestamp,
                    user: bid.user.email,
                    createdAt: bid.createdAt
                },
                ...cleanItem.bids
            ]);
        });
        return cleanItem;
    }
    // if (item.bids) {
    //     item.bids.map((bid) => {
    //         return (cleanItem.bids = [bid.amount, ...cleanItem.bids]);
    //     });
    //     return cleanItem;
    // }
}

module.exports = {
    getByAuthor,
    getByLatestBid,
    getById,
    getAll,
    addBid,
    create,
    update,
    destroy
}