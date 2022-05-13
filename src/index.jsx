import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Node } from './Node';

function install(editor, { component: NodeComponent = Node }) {
    editor.on('rendernode', ({ el, node, component, bindSocket, bindControl }) => {
        if (component.render && component.render !== 'react') return;
        const Component = component.component || NodeComponent;

        node.update = () => new Promise((res) => {
            // eslint-disable-next-line
            const ComponentWithCallback = ({ node, editor, bindSocket, bindControl, res }) => {
                useEffect(() => {
                    res()
                });
                return <Component node={node} editor={editor} bindSocket={bindSocket} bindControl={bindControl} />
            }

            const root = createRoot(el);
            
            root.render(<ComponentWithCallback node={node} editor={editor} bindSocket={bindSocket} bindControl={bindControl} res={res} />);
        });
        node._reactComponent = true;
        node.update();
    });

    editor.on('rendercontrol', ({ el, control }) => {
        if (control.render && control.render !== 'react') return;
        const Component = control.component;

        control.update = () => new Promise((res) => {
            // eslint-disable-next-line
            const ComponentWithCallback = ({ node, editor, bindSocket, bindControl, res }) => {
                useEffect(() => {
                    res()
                });
                return <Component node={node} editor={editor} bindSocket={bindSocket} bindControl={bindControl} />
            }

            const root = createRoot(el);

            root.render(<ComponentWithCallback {...control.props} res={res} />);
        });
        control.update();
    });

    editor.on('connectioncreated connectionremoved', connection => {
        connection.output.node.update();
        connection.input.node.update();
    });

    editor.on('nodeselected', () => {
        editor.nodes.filter(n => n._reactComponent).map(node => node.update());
    });
}

export { Node } from './Node';
export { Socket } from './Socket';
export { Control } from './Control';

export default {
    name: 'react-render',
    install
}