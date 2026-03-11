import {MongoClient} from "mongodb";
import express from "express";

export class Global {
    static mongo: MongoClient;
    static jwtSecret?: string;
    static app: express.Express;

    static get mongoClient(){
        return this.mongo;
    }

    static get jwt() {
        return this.jwtSecret || "dev-secret-change-me";
    }
}