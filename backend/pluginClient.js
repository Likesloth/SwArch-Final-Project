const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = './plugin.proto'; // Path to plugin.proto
const OPTIONS = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

const packageDefinition = protoLoader.loadSync(PROTO_PATH, OPTIONS);
// Changed: Use the Counter service from the loaded package definition
const counterProto = grpc.loadPackageDefinition(packageDefinition).Counter;

module.exports = new counterProto(
    `${process.env.PLUGIN_HOST}:${process.env.PLUGIN_PORT}`, // Changed: Updated host and port based on environment variables
    grpc.credentials.createInsecure()
);
