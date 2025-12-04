export declare const config: {
    app: {
        nodeEnv: string;
        port: number;
        logLevel: string;
    };
    database: {
        url: string;
    };
    session: {
        secret: string;
        cookie: {
            domain: string;
            secure: boolean;
            sameSite: any;
        };
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
    };
    s3: {
        provider: string;
        region: string;
        bucket: string;
        accessKey: string;
        secretKey: string;
        minioEndpoint: string;
        awsEndpoint: string;
    };
    realEstateData: {
        provider: string;
        apiKey: string | undefined;
    };
    hasData: {
        apiKey: string | undefined;
        enabled: boolean;
    };
    cors: {
        origin: string[];
    };
    frontendUrl: string;
};
//# sourceMappingURL=config.d.ts.map