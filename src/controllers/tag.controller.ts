import {Tag} from "../models/tag.ts";
import sanitize from "mongo-sanitize";
import {StatusCodes} from "http-status-codes";

export class TagController {

    async getTag(req: any, res: any, next: any) {
        Tag.findOne({$or: [
                {name: sanitize(req.params.name)},
                {name: sanitize(req.body.name)}
            ]})
            .then((data: any) => {
                req.tag = data;
                next();
            })
            .catch((e: any) => {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("There was an error while retrieving the data");
                console.log(e);
            })
    }

    async checkPostRedirect(req: any, res: any, next: any) {
        if (!req.tag) {
            next();
        } else {
            res.status(StatusCodes.OK).json(req.tag);
        }
    }

    async ensureTagExistence(req: any, res: any, next: any) {
        if (!req.tag) {
            res.status(StatusCodes.NOT_FOUND).json("Tag not found");
        } else {
            next();
        }
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