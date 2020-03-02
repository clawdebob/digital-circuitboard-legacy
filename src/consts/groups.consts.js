import elementBuilder from "../modules/elementBuilder";

function ElementBase(name) {
    this.name = name;
    this.create = elementBuilder.getCreateFuncByName(name);
    this.icon = elementBuilder.getIconByName(name);
}

export const GROUPS = [
    {
        name: 'Base',
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
        name: 'Gates',
        elements: ['Invertor', 'Bus'],
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
    {name: 'Input/Output', elements: ['Bulb', 'Button', 'Contact']},
];
