// users hardcoded for simplicity, store in a db for production applications
const users = [{ id: 1, username: 'test', password: 'test', firstName: 'admin', lastName: 'admin' }];

async function getAuthenticatedUser({ username, password }) {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        // eslint-disable-next-line no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

async function getAllUsers() {
    return users.map(u => {
        // eslint-disable-next-line no-unused-vars
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
    });
}

export {getAuthenticatedUser, getAllUsers}
