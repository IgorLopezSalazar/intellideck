import {Tag} from "../models/tag.ts";
import sanitize from "mongo-sanitize";
import {StatusCodes} from "http-status-codes";

export class TagController {

    async getTag(req: any, res: any, next: any) {
        Tag.findOne({name: sanitize(req.params.name)})
            .then((data: any) => {
                if (!data) {
                    next();
                } else {
                    res.status(StatusCodes.OK).json(data);
                }
            })
            .catch((e: any) => {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("There was an error while retrieving the data");
                console.log(e);
            })
    }

    async getTags(req: any, res: any, next: any) {
        Tag.find({name: {$nin: [sanitize(req.body.tags)]}}, "_id")
            .then((data: any) => {
                if (req.body.tags && req.body.tags.length != data.length) {
                    res.status(StatusCodes.BAD_REQUEST).json("Some tags could not be found");
                } else {
                    next();
                }
            })
            .catch((e: any) => {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("There was an error while retrieving the data");
                console.log(e);
            })
    }

    async getTagsByPattern(req: any, res: any) {
        Tag.find({name: new RegExp(sanitize(req.params.pattern), 'i')})
            .then((data: any) => {
                if (!data || data.length == 0) {
                    res.status(StatusCodes.NO_CONTENT).json();
                } else {
                    res.status(StatusCodes.OK).json(data);
                }
            })
            .catch((e: any) => {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("There was an error while retrieving the data");
                console.log(e);
            })
    }

    async postTag(req: any, res: any) {
        let tag = new Tag({
            name: sanitize(req.params.name)
        })
        Tag.create(tag)
            .then((data: any) => {
                res.status(StatusCodes.OK).json(data);
            })
            .catch((e: any) => {
                res.status(StatusCodes.BAD_REQUEST).json("The tag did not exist and could not be created");
                console.log(e);
            })
    }
}