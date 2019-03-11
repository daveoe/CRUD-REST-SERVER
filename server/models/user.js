const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


let rolesValidate = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} is not a valid role'
};


let Schema = mongoose.Schema;


let userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'The name is required']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'The email is required']
    },
    password: {
        type: String,
        required: [true, 'The password is required']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidate
    },
    status: {    // Boolean
        type: Boolean,
        default: true
    },
    google: {   // Boolean
        type: Boolean,
        default: false
    }
});

// This way we modified the userSchema when it's printed to JSON 
// So when the user sends his data, the password doesn't show in the JSON, but it is saved in the Data Base
userSchema.methods.toJSON = function() {
    let user_ = this;
    let user_Object = user_.toObject();
    delete user_Object.password;

    return user_Object;
}

// Unique Validator
userSchema.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});


module.exports = mongoose.model('User', userSchema);