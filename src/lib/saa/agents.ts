// Office Data
export interface Office {
  name: string;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  address: string; // Full address for display
  phone: string;
}

export const offices: Record<string, Office> = {
  Ulverstone: {
    name: "Ulverstone",
    street: "2/26 King Edward Street",
    suburb: "Ulverstone",
    state: "TAS",
    postcode: "7315",
    address: "2/26 King Edward Street, Ulverstone, TAS 7315",
    phone: "03 6425 7999",
  },
  Penguin: {
    name: "Penguin",
    street: "54 Main Road",
    suburb: "Penguin",
    state: "TAS",
    postcode: "7316",
    address: "54 Main Road, Penguin, TAS 7316",
    phone: "03 6437 1755",
  },
};

// Agent Data
export interface Agent {
  name: string;
  office: string;
  email: string;
  mobile: string;
}

export const agents: Agent[] = [
  {
    name: "Wendy Squibb",
    office: "Ulverstone",
    email: "w.squibb@harcourts.com.au",
    mobile: "+61 417059924",
  },
  {
    name: "Kurt Knowles",
    office: "Ulverstone",
    email: "kurt.knowles@harcourts.com.au",
    mobile: "+61 438360631",
  },
  {
    name: "Jakub Lehman",
    office: "Ulverstone",
    email: "jakub.lehman@harcourts.com.au",
    mobile: "+61 487884718",
  },
  {
    name: "Jarrod Burr",
    office: "Ulverstone",
    email: "jarrod.burr@harcourts.com.au",
    mobile: "+61 418213931",
  },
  {
    name: "Raymond Buitenhuis",
    office: "Ulverstone",
    email: "raymond.buitenhuis@harcourts.com.au",
    mobile: "+61 408144360",
  },
  {
    name: "Jodi Tunn",
    office: "Penguin",
    email: "jodi.tunn@harcourts.com.au",
    mobile: "+61 409571361",
  },
  {
    name: "Colin Tunn",
    office: "Penguin",
    email: "colin.tunn@harcourts.com.au",
    mobile: "+61 428846474",
  },
  {
    name: "Brad Reeves",
    office: "Ulverstone",
    email: "brad.reeves@harcourts.com.au",
    mobile: "+61 421754973",
  },
  {
    name: "Elijah Mirandilla",
    office: "Ulverstone",
    email: "elijah.mirandilla@harcourts.com.au",
    mobile: "+63 9665971704",
  },
];

export function getAgentByName(name: string): Agent | undefined {
  return agents.find((agent) => agent.name === name);
}

export function getOfficeByName(name: string): Office | undefined {
  return offices[name];
}
