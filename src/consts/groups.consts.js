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
            new ElementBase('Nxor')
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
        name: 'groups.io',
        elements: [
            new ElementBase('Constant'),
            new ElementBase('Button'),
            new ElementBase('OutContact')
        ]
    },
];
