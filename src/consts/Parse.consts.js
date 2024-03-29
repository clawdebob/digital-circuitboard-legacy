export const PROPS_TO_INCLUDE = [
    'name',
    'props',
    'outContacts',
    'className',
    'x',
    'y',
    'id',
    'width',
    'height',
    'signature',
    'signatureSize',
    'interactable',
    'originY'
];
export const PIN_PROPS_TO_INCLUDE = [
    'invert',
    'value'
];
export const CONNECTOR_PROPS_TO_INCLUDE = [
    'pin',
    'type'
];

export const UNEDITABLE_PROPS = {
    inContacts: ['Buffer', 'Invertor', 'OutContact'],
    invert1: ['Buffer', 'Invertor'],
};
