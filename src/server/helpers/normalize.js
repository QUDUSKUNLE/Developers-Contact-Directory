

export default {
  text: word => word
    .toLowerCase()
    .split(' ')
    .map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' '),

  extractData: data => data.map((x) => {
    return {
      _id: x._id,
      username: x.username,
      address: x.address,
      developer: x.developer,
      location: x.location,
      stacks: x.stacks
    }
  })
};
