const express = require('express');
const router = express.Router();
const _ = require('lodash');
const imageDB = require('../../models').CustomImage;
const {
    execSync,
    exist,
    mkdir,
    rm
} = require("../../core/utils");
const path = require('path');
const image_size = require('image-size');

const multer = require('multer')
const upload = multer({
    dest: __dirname + '/uploads/', // 이미지 업로드 경로
});

router.post('/upload', upload.single('file'), async function (req, res, next) {
    let resPayload = {
        isSuccess: false,
    };

    // console.dir(req.file);

    const {
        filename
    } = req.file
    const {
        name,
        type
    } = req.body;

    let imageResult = await imageDB.find({
        type,
        name
    });

    if (!_.isEmpty(imageResult)) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: '이미 등록된 이미지입니다.'
        }
        await rm(path.join(__dirname, 'uploads', filename));
        return res.json(resPayload);
    }

    // 확장자
    let imageSize = image_size(path.join(__dirname, 'uploads', filename));
    const ext = imageSize.type;

    // type에 해당하는 폴더가 없을경우 생성
    if (!(await exist(path.join(process.cwd(), 'public', type)))) {
        await mkdir(path.join(process.cwd(), 'public', type));
    }

    // 실제 업로드 된 이미지를 옮겨주는 용도
    await execSync(`cp ${path.join(__dirname, 'uploads', filename)} ${path.join(process.cwd(), 'public', type, name)}.${ext}`)
    await rm(path.join(__dirname, 'uploads', filename));

    let imageUrl = `${path.join(type, name)}.${ext}`;
    let imageH = imageSize.height;
    let imageW = imageSize.width;

    try {
        await imageDB.create({
            name,
            type,
            imageUrl,
            imageH,
            imageW
        });
        resPayload.isSuccess = true;
        resPayload.payload = {
            image: {
                name,
                type,
                imageUrl,
                imageH,
                imageW
            }
        }
        return res.json(resPayload);
    } catch (e) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: '등록에 실패하였습니다.'
        }
    }
});

router.get('/:type/:name', async function (req, res, next) {
    let resPayload = {
        isSuccess: false,
    };

    let imageResult = await imageDB.find({
        type: req.params.type,
        name: req.params.name
    }).lean();

    if (_.isEmpty(imageResult)) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: '일치하는 이미지가 없습니다.'
        }
        // await rm(path.join(__dirname, 'uploads', filename));
        return res.json(resPayload);
    } else {
        resPayload.isSuccess = true;
        resPayload.payload = {
            image: _.pick(imageResult[0], ['imageUrl', 'imageW', 'imageH'])
        }
        // await rm(path.join(__dirname, 'uploads', filename));
        return res.json(resPayload);
    }
});

router.get('/', async function (req, res, next) {
    let resPayload = {
        isSuccess: false,
    };

    let imageResult = await imageDB.find().lean();

    resPayload.isSuccess = true;
    resPayload.payload = {
        images: imageResult
    }
    // await rm(path.join(__dirname, 'uploads', filename));
    return res.json(resPayload);
});

module.exports = router;