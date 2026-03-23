import { Schema, model, Document, Types } from 'mongoose';
import { FarmerStatus } from '@dmrv/constants';

export interface IFarmerDoc extends Document {
  farmerId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  contact: {
    phone?: string;
    email?: string;
    address?: string;
  };
  nationalId?: string;
  landTitleDeed?: string;
  status: FarmerStatus;
  registrationDate: Date;
  socioEconomic: {
    householdSize: number;
    annualIncome?: number;
    primaryLivelihood: string;
    educationLevel?: string;
    accessToCredit: boolean;
    genderOfHousehold: string;
  };
  consent: {
    fpicGranted: boolean;
    consentDate?: Date;
    consentPhotoUrl?: string;
    witnessName?: string;
  };
  sdgTags: number[];
  assignedEnumerator?: string;
  notes?: string;
  photoUrl?: string;
  projectId: Types.ObjectId;
}

const FarmerSchema = new Schema<IFarmerDoc>(
  {
    farmerId: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fullName: { type: String },
    contact: {
      phone: String,
      email: String,
      address: String,
    },
    nationalId: { type: String, sparse: true },
    landTitleDeed: String,
    status: {
      type: String,
      enum: Object.values(FarmerStatus),
      default: FarmerStatus.PENDING,
    },
    registrationDate: { type: Date, default: Date.now },
    socioEconomic: {
      householdSize: { type: Number, default: 1 },
      annualIncome: Number,
      primaryLivelihood: { type: String, default: 'farming' },
      educationLevel: String,
      accessToCredit: { type: Boolean, default: false },
      genderOfHousehold: { type: String, default: 'male' },
    },
    consent: {
      fpicGranted: { type: Boolean, default: false },
      consentDate: Date,
      consentPhotoUrl: String,
      witnessName: String,
    },
    sdgTags: [{ type: Number }],
    assignedEnumerator: String,
    notes: String,
    photoUrl: String,
    projectId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Project', 
      required: true,
      index: true 
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: full name
FarmerSchema.pre('save', function (next) {
  this.fullName = `${this.firstName} ${this.lastName}`;
  next();
});

// Text search index
FarmerSchema.index({ firstName: 'text', lastName: 'text', 'contact.address': 'text' });

export const Farmer = model<IFarmerDoc>('Farmer', FarmerSchema);
