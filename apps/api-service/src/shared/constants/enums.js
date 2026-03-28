"use strict";
// Enums for the DMRV system
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncStatus = exports.ReportStatus = exports.PlotLandUse = exports.CertificationStandard = exports.ActivityType = exports.TreeCondition = exports.FarmerStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["ENUMERATOR"] = "enumerator";
    UserRole["AUDITOR"] = "auditor";
    UserRole["PROJECT_DEVELOPER"] = "project_developer";
})(UserRole || (exports.UserRole = UserRole = {}));
var FarmerStatus;
(function (FarmerStatus) {
    FarmerStatus["PENDING"] = "pending";
    FarmerStatus["ACTIVE"] = "active";
    FarmerStatus["INACTIVE"] = "inactive";
    FarmerStatus["SUSPENDED"] = "suspended";
})(FarmerStatus || (exports.FarmerStatus = FarmerStatus = {}));
var TreeCondition;
(function (TreeCondition) {
    TreeCondition["HEALTHY"] = "healthy";
    TreeCondition["STRESSED"] = "stressed";
    TreeCondition["DEAD"] = "dead";
    TreeCondition["REPLANTED"] = "replanted";
    TreeCondition["DISEASED"] = "diseased";
})(TreeCondition || (exports.TreeCondition = TreeCondition = {}));
var ActivityType;
(function (ActivityType) {
    ActivityType["PLANTING"] = "planting";
    ActivityType["MAINTENANCE"] = "maintenance";
    ActivityType["PEST_CONTROL"] = "pest_control";
    ActivityType["PRUNING"] = "pruning";
    ActivityType["IRRIGATION"] = "irrigation";
    ActivityType["MONITORING"] = "monitoring";
    ActivityType["HARVESTING"] = "harvesting";
    ActivityType["REPLANTING"] = "replanting";
})(ActivityType || (exports.ActivityType = ActivityType = {}));
var CertificationStandard;
(function (CertificationStandard) {
    CertificationStandard["VERRA_VCS"] = "verra_vcs";
    CertificationStandard["GOLD_STANDARD"] = "gold_standard";
    CertificationStandard["VERRA_CCB"] = "verra_ccb";
})(CertificationStandard || (exports.CertificationStandard = CertificationStandard = {}));
var PlotLandUse;
(function (PlotLandUse) {
    PlotLandUse["CROPLAND"] = "cropland";
    PlotLandUse["GRASSLAND"] = "grassland";
    PlotLandUse["FOREST"] = "forest";
    PlotLandUse["DEGRADED"] = "degraded";
    PlotLandUse["AGROFORESTRY"] = "agroforestry";
    PlotLandUse["BARREN"] = "barren";
})(PlotLandUse || (exports.PlotLandUse = PlotLandUse = {}));
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["DRAFT"] = "draft";
    ReportStatus["SUBMITTED"] = "submitted";
    ReportStatus["UNDER_REVIEW"] = "under_review";
    ReportStatus["APPROVED"] = "approved";
    ReportStatus["REJECTED"] = "rejected";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
var SyncStatus;
(function (SyncStatus) {
    SyncStatus["PENDING"] = "pending";
    SyncStatus["SYNCED"] = "synced";
    SyncStatus["CONFLICT"] = "conflict";
    SyncStatus["FAILED"] = "failed";
})(SyncStatus || (exports.SyncStatus = SyncStatus = {}));
//# sourceMappingURL=enums.js.map