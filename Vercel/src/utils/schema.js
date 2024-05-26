const postSchema = {
  struct: {
    owner: { array: { type: "u8", len: 32 } },
    parentPost: { array: { type: "u8", len: 32 } },
    rudeness: "bool",
    cid: "string",
    content: "string",
    timestamp: "u32",
  },
};

const addPostSchema = {
  struct: {
    instruction: "u8",
    bump: "u8",
    seed: "string",
    space: "u16",
    owner: { array: { type: "u8", len: 32 } },
    parentPost: { array: { type: "u8", len: 32 } },
    rudeness: "bool",
    cid: "string",
    content: "string",
    timestamp: "u32",
  },
};

// User Schemas

const userSchema = {
  struct: {
    owner: { array: { type: "u8", len: 32 } },
    username: "string",
    timestamp: "u32",
    followers: "u32",
  },
};

const addUserSchema = {
  struct: {
    instruction: "u8",
    bump: "u8",
    seed: "string",
    space: "u16",
    owner: { array: { type: "u8", len: 32 } },
    username: "string",
    timestamp: "u32",
    followers: "u32",
  },
};

// Instruction Schemas

const withdrawSchema = {
  struct: { instruction: "u8" },
};

export { postSchema, addPostSchema, userSchema, addUserSchema, withdrawSchema };
