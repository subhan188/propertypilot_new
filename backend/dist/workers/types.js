/**
 * Job types and interfaces for BullMQ worker queue
 */
export var JobType;
(function (JobType) {
    JobType["REFRESH_PROPERTY_COMPS"] = "refresh-property-comps";
    JobType["SYNC_AIRDNA_DATA"] = "sync-airdna-data";
    JobType["GENERATE_DAILY_ALERTS"] = "generate-daily-alerts";
    JobType["GENERATE_REPORT"] = "generate-report";
})(JobType || (JobType = {}));
//# sourceMappingURL=types.js.map