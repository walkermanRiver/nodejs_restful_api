// users hardcoded for simplicity, store in a db for production applications
const users = [{ username: 'test', password: 'test', firstName: 'test first name', lastName: 'test last name' },
{username: 'admin', password: 'admin', firstName: 'admin first name', lastName: 'admin last name'}];

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
