import { Request, NextFunction, Express } from "express"
import { Document, Types } from "mongoose"

declare module "multer-s3-transform"

export interface Moment extends Document {
  photographerId: Types.ObjectId
  filename: string
  mimeType: string
  bucket: string
  contentType: string
  location: string
  originalEtag: string
  resizedLocation: string
  resizedEtag: string
  amount: number
}

export interface User extends Document {
  id: string
  email?: string
  password?: string
  businessName?: string
  address?: string
  firstName?: string
  lastName?: string
  displayName?: string
  selectedPhoto?: string
}

export interface Order extends Document {
  moments: Type.ObjectId[]
  amount: number
  name: string
  email: string
  addressLine1: string
  addressLine2: string
  city: string
  postalCode: string
  state: string
  country: string
}

export interface Payment extends Document {
  orderId: Types.ObjectId
  moments: Types.ObjectId[]
  amount: number
  paid: boolean
  status: string
  receipt: string
  stripeCharge: any
  purchased: Date
}

export interface UserRequest extends Request {
  user: User
}

export interface FileRequest extends Request {
  file: UploadedFile
  user: User
}

export interface OrderRequest extends Request {
  user: User
  file: UploadedFile
  params: OrderParams
}

export interface UploadedFile {
  originalname: string
  mimetype: string
  transforms: TransformedFile[]
  buffer: Buffer
}

export interface MulterFile {
  mimetype: string
}

export interface TransformedFile {
  id: string
  bucket: string
  contentType: string
  location: string
  etag: string
  key: string
}

export interface LogInRequest extends Request {
  logIn(user: User, callback: (err: any, user: User, info: any) => void): void
}

export interface LogInRequestCallback {
  err: any
  user: User
  info: any
}

export interface RegisterRequest extends Request {}

export interface JWTPayload {
  data: User
  iat: number
  exp: number
}
