import { MongoClient, ObjectId } from "mongodb"
import {Global} from "../Global";

export type UserRole = "ADMIN" | "USER"

export interface UserDoc {
  _id: ObjectId
  email: string
  passwordHash: string
  role: UserRole
  createdAt: Date
}

export class UserService {
  static collection() {
    return Global.mongoClient.db().collection<UserDoc>("users")
  }

  static async ensureIndexes() {
    const col = this.collection()
    await col.createIndex({ email: 1 }, { unique: true })
  }

  static async countUsers(): Promise<number> {
    const col = this.collection()
    return col.estimatedDocumentCount()
  }

  static async createUser(email: string, passwordHash: string, role: UserRole): Promise<UserDoc> {
    const col = this.collection()
    const doc: Omit<UserDoc, "_id"> = { email, passwordHash, role, createdAt: new Date() }
    const res = await col.insertOne(doc as any)
    return { ...(doc as any), _id: res.insertedId }
  }

  static async findByEmail(email: string): Promise<UserDoc | null> {
    const col = this.collection()
    return col.findOne({ email })
  }

  static async findById(id: string): Promise<UserDoc | null> {
    const col = this.collection()
    return col.findOne({ _id: new ObjectId(id) })
  }

  static async listUsers(): Promise<Pick<UserDoc, "_id"|"email"|"role"|"createdAt">[]> {
    const col = this.collection()
    const users = await col.find({}, { projection: { email: 1, role: 1, createdAt: 1 } }).toArray()
    return users.map(u => ({ _id: u._id, email: u.email, role: u.role, createdAt: u.createdAt }))
  }

  static async setRole(userId: string, role: UserRole): Promise<boolean> {
    const col = this.collection()
    const res = await col.updateOne({ _id: new ObjectId(userId) }, { $set: { role } })
    return res.matchedCount > 0
  }
}
