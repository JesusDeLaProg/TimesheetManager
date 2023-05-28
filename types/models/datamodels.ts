export type StringId = string;

export enum ProjectType {
    PRIVE = "Privé",
    PUBLIC = "Public"
}

export enum UserRole {
    USER = 1,
    SUBADMIN = 2,
    ADMIN = 4,
    SUPERADMIN = 8
}

export interface IBillingRate {
    begin: Date;
    end?: Date;
    rate: number;
    jobTitle: string;
}

export interface IBillingGroup {
    projectType: ProjectType;
    timeline: IBillingRate[];
}

export interface IUser {
    _id?: StringId;
    username: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    email: string;
    password?: string;
    billingGroups: IBillingGroup[];
    isActive: boolean;
}

export interface IActivity {
    _id?: StringId;
    code: string;
    name: string;
}

export interface IPhase {
    _id?: StringId;
    code: string;
    name: string;
    activities: StringId[];
}

export interface IClient {
    _id?: StringId;
    name: string;
}

export interface IProject {
    _id?: StringId;
    code: string;
    name: string;
    client: string;
    type: ProjectType;
    isActive: boolean;
}

export interface ITimesheet {
    _id?: StringId;
    user: StringId;
    begin: Date;
    end: Date;
    lines: ITimesheetLine[];
    roadsheetLines: IRoadsheetLine[];
}

export interface ITimesheetLine {
    project: StringId;
    phase: StringId;
    activity: StringId;
    divers?: string;
    entries: ITimesheetEntry[];
}

export interface ITimesheetEntry {
    date: Date;
    time: number;
}

export interface IRoadsheetLine {
    project: StringId;
    travels: ITravel[];
}

export interface ITravel {
    date: Date;
    from: string;
    to: string;
    distance: number;
    expenses: IExpense[];
}

export interface IExpense {
    description: string;
    amount: number;
}
