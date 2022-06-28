import raw_basic_auth from './raw-basic-auth.js';
import passport_basic_auth from './passport-basic-auth.js';
import { readFile } from "fs/promises";

const config = JSON.parse(await readFile("./app/config.json"));

let get_auth;
if(config.auth_method === 'raw_basic'){
  get_auth = raw_basic_auth;
}else{
  get_auth = passport_basic_auth;
}

export default get_auth
