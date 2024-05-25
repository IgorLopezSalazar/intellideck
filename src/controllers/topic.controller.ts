import {Topic} from "../models/topic.ts";
import sanitize from "mongo-sanitize";
import {StatusCodes} from "http-status-codes";

export class TopicController {
    async postTopic(req: any, res: any, next: any) {
        let topic = new Topic({
            name: sanitize(req.body.name)
        })
        Topic.create(topic)
            .then((data: any) =>
                res.status(StatusCodes.CREATED).json(data))
            .catch((e: any) => {
                next(e);
            })
    }

    async deleteTopic(req: any, res: any, next: any) {
        Topic.findByIdAndDelete(sanitize(req.params.id))
            .then((data: any) =>
                res.status(StatusCodes.NO_CONTENT).json())
            .catch((e: any) => {
                next(e);
            })
    }

    async getTopics(req: any, res: any, next: any) {
        Topic.find({})
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

    async validateTopic(req: any, res: any, next: any) {
        Topic.findById(sanitize(req.body.topic))
            .then((data: any) => {
                if (!data && req.body.topic) {
                    res.status(StatusCodes.NOT_FOUND).json();
                } else {
                    next();
                }
            })
            .catch((e: any) => {
                next(e);
            })
    }

    async putTopic(req: any, res: any, next: any) {
        Topic.findByIdAndUpdate(sanitize(req.params.id), {
                name: sanitize(req.body.name)
            },
            {returnOriginal: false, runValidators: true})
            .then((data: any) => {
                if(!data) {
                    res.status(StatusCodes.NOT_FOUND).json();
                }
                else {
                    res.status(StatusCodes.OK).json(data);
                }
            })
            .catch((e: any) => {
                next(e);
            })
    }
}