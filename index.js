const fs = require('fs');
const dayjs = require('dayjs');

const store = __dirname + '/store.json';

if (!fs.existsSync(store)) {
    fs.writeFileSync(store, JSON.stringify({ store: [] }, null, 4));
}

const rhas = (key) => {
    const data = JSON.parse(fs.readFileSync(store));
    const keys = data.store.map(item => item.key);
    return keys.includes(key);
}

const radd = (key, value, ttl = 0) => {
    if (!rhas(key)) {
        const data = fs.readFileSync(store);
        const json = JSON.parse(data);
        json.store.push({ key, value, ttl: ttl === 0 ? 0 : dayjs().add(ttl, 'second').unix() });
        fs.writeFileSync(store, JSON.stringify(json, null, 4));
        console.log(`${key} added`);
    }
    return console.log(`> ${key} already is db`);
}

const rget = (key) => {
    const data = JSON.parse(fs.readFileSync(store));
    const item = data.store.find(item => item.key === key);
    if (item) {
        if (item.ttl !== 0 && dayjs().unix() > item.ttl) {
            console.log(`> ${key} expired`);
            return null;
        }
        return item.value;
    }
    console.log(`> ${key} not found`);
    return null;
}

const rdel = (key) => {
    const data = JSON.parse(fs.readFileSync(store));
    const index = data.store.findIndex(item => item.key === key);
    if (index > -1) {
        data.store.splice(index, 1);
        fs.writeFileSync(store, JSON.stringify(data, null, 4));
        console.log(`> ${key} deleted`);
    }
    return console.log(`> ${key} not found`);
}

const rclear = () => {
    fs.writeFileSync(store, JSON.stringify({ store: [] }, null, 4));
    console.log(`> db cleared`);
}

const rlist = () => {
    const data = JSON.parse(fs.readFileSync(store));
    data.store.forEach(item => {
        console.log(`> ${item.key}`);
    });
}

setInterval(() => {
    const data = JSON.parse(fs.readFileSync(store));
    data.store = data.store.filter(item => item.ttl === 0 || dayjs().unix() < item.ttl);
    fs.writeFileSync(store, JSON.stringify(data, null, 4));
}, 1000);


module.exports = { rhas, radd, rget, rdel, rclear, rlist };