const rd = {
    command: "rd",
    description: "Remove duplicates in all playlist",
    builder: (yargs, helpOrVersionSet) => {
        return yargs;
    },
    handler: async (argv) => {
        console.log("Removed some duplicates !")
    },
};

export default rd;
