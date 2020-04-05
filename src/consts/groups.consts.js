import elementBuilder from "../services/elementBuilder";

function ElementBase(name) {
    this.name = 'elements.' + name.toLowerCase();
    this.create = elementBuilder.getCreateFuncByName(name);
    this.icon = elementBuilder.getIconByName(name);
}

export const GROUPS = [
    {
        name: 'groups.base',
        elements: [
            new ElementBase('Or'),
            new ElementBase('Nor'),
            new ElementBase('And'),
            new ElementBase('Nand'),
            new ElementBase('Xor'),
            new ElementBase('Nxor'),
            new ElementBase('Constant'),
            new ElementBase('Button'),
        ],
    },
    {
        name: 'groups.gates',
        elements: [
            new ElementBase('Invertor'),
            new ElementBase('Buffer')
        ],
    },
    {
        name: 'Plexers',
        elements: ['Multiplexor', 'Demultiplexor', 'Decoder', 'Coder'],
    },
    {
        name: 'Arithmetic',
        elements: ['Summator']
    },
    {name: 'Memory', elements: ['ROM', 'RAM']},
    {name: 'groups.io', elements: ['Bulb', 'Button', 'Contact']},
];
