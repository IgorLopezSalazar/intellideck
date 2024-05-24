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
                next(e);
            })
    }

    async validateTags(req: any, res: any, next: any) {
        Tag.find({name: {$nin: [sanitize(req.body.tags)]}}, "_id")
            .then((data: any) => {
                if (req.body.tags && req.body.tags.length != data.length) {
                    res.status(StatusCodes.NOT_FOUND).json();
                } else {
                    next();
                }
            })
            .catch((e: any) => {
                next(e);
            })
    }

    async getTags(req: any, res: any, next: any) {
        Tag.find({})
            .then((data: any) => {
                if (!data || data.length == 0) {
                    res.status(StatusCodes.NO_CONTENT).json();
                } else {
                    res.status(StatusCodes.OK).json(data);
                }
            })
            .catch((e: any) => {
                next(e);
            })
    }

    async postTag(req: any, res: any, next: any) {
        let tag = new Tag({
            name: sanitize(req.params.name)
        })
        Tag.create(tag)
            .then((data: any) => {
                res.status(StatusCodes.CREATED).json(data);
            })
            .catch((e: any) => {
                next(e);
            })
    }
}