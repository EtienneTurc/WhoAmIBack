exports.getConfig = () => {
    if (process.env.NODE_ENV === 'dev') {
        return require('./config/config_dev');
    } else {
        return require('./config/config_prod');
    }
}