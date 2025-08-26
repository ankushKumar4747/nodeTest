const express = require("express");
const app = express();
const multer = require("multer")
const fs = require("fs").promises
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + "/images")
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now()
        cb(null, uniqueSuffix + "-" + file.originalname)
        req.fileName = uniqueSuffix + "-" + file.originalname;
    }
})
const upload = multer({ storage: storage })

app.get("/employee", async (req, res) => {
    let data = await fs.readFile("emp.json", "utf-8")
    data = JSON.parse(data);
    let result = data.filter((val, idx) => {
        if (!val.isDeleted) return val
    })
    res.status(200).json(result)
})

app.get("/employee/:id", async (req, res) => {
    let data = await fs.readFile("emp.json", "utf-8")
    data = JSON.parse(data);
    res.status(200).json(data[Number(req.params.id) - 1])

})

app.get("/search", async (req, res) => {
    let data = await fs.readFile("emp.json", "utf-8")
    data = JSON.parse(data);
    const search = req.query;
    let result = data.filter((val, idx) => {
        if (val.name == search.name && Number(val.salary) >= Number(search.salarygte)) {
            return val
        }
    })
    res.status(200).json(result)
})

app.get('/delete', async (req, res) => {
    let data = await fs.readFile("emp.json", "utf-8")
    data = JSON.parse(data);
    if (req.query.includeDeleted == "true") {
        console.log("................");
        return res.status(200).json(data)
    } else {
        console.log(".........zzz");
        let result = data.filter((val, idx) => {
            if (!val.isDeleted) return val
        })
        res.status(200).json(result)
    }


})



app.post("/employee", upload.single("image"), async (req, res) => {
    const data = await fs.readFile("emp.json", "utf-8")
    // console.log(req.fileName);
    // console.log(upload.storage);

    console.log('data: ', data);

    if (data.length == 0) {
        let obj = req.body;
        obj.id = 1;
        obj.isDeleted = false;
        obj.image = req.fileName
        let arr = [obj]
        await fs.writeFile("emp.json", JSON.stringify(arr))
    } else {
        let arr = JSON.parse(data);
        let obj = req.body;
        obj.id = arr.length + 1;
        obj.image = req.fileName
        obj.isDeleted = false;
        arr.push(obj)
        await fs.writeFile("emp.json", JSON.stringify(arr))
    }
    res.status(200).json({
        message: "sucess",
        status: 200
    })
})

app.post("/employee/:id/update-image", upload.single("image"), async (req, res) => {
    let data = await fs.readFile("emp.json", "utf-8")
    data = JSON.parse(data);

    data[Number(req.params.id) - 1].image = req.fileName;

    console.log(data);
    await fs.writeFile("emp.json", JSON.stringify(data))
    res.status(200).json({
        status: 200,
        message: "updated"
    })
})


app.put("/employee/:id", upload.single("image"), async (req, res) => {
    let data = await fs.readFile("emp.json", "utf-8")
    data = JSON.parse(data);
    let keys = Object.keys(req.body);
    for (let i = 0; i < keys.length; i++) {
        data[Number(req.params.id) - 1][keys[i]] = req.body[keys[i]]
    }
    console.log(data);
    await fs.writeFile("emp.json", JSON.stringify(data))
    res.status(200).json({
        message: "update sucess",
        status: 200
    })
})

app.delete("/employee/:id", async (req, res) => {
    let data = await fs.readFile("emp.json", "utf-8")
    data = JSON.parse(data);
    data[Number(req.params.id) - 1].isDeleted = true
    console.log(data);
    await fs.writeFile("emp.json", JSON.stringify(data))
    res.status(200).json({
        message: "delete sucess",
        status: 200
    })

})


app.put("/employee/restore/:id", async (req, res) => {
    let data = await fs.readFile("emp.json", "utf-8")
    data = JSON.parse(data);
    data[Number(req.params.id) - 1].isDeleted = false;
    await fs.writeFile("emp.json", JSON.stringify(data))
    res.status(200).json({
        message: "restore  sucess",
        status: 200
    })
})
app.listen(4000, () => {
    console.log("server is started");
})