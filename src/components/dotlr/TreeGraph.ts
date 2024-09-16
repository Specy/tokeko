import * as d3 from 'd3';

import {stringifyItem} from '@specy/dotlr/utils';
import type {State, Tree} from '@specy/dotlr/types';

type VisualizationConfig = {
    curveFactor: number;
    nodeSize: number;
}

export class ParseTreeVisualization {
    private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    private width: number;
    private height: number;
    private toDispose: (() => void)[] = [];
    tree: Tree;
    private target: HTMLElement;
    private svgGroup: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private config: VisualizationConfig;
    private bg: d3.Selection<SVGRectElement, unknown, HTMLElement, any>;

    constructor(tree: Tree, target: HTMLElement, config: Partial<VisualizationConfig> = {}) {
        this.tree = tree;
        this.target = target;
        this.config = {
            curveFactor: 0.1,
            nodeSize: 30,
            ...config
        };
        this.svg = d3.select(this.target).append('svg');
        this.updateDimensions(target);
        const resizeObserver = new ResizeObserver(() => this.updateDimensions(target));
        resizeObserver.observe(this.target);
        this.toDispose.push(() => resizeObserver.disconnect());
    }

    dispose(): void {
        this.toDispose.forEach(dispose => dispose());
        this.svg.remove();
    }

    private updateDimensions(container: HTMLElement): void {
        if (container) {
            const width = container.clientWidth
            const height = container.clientHeight;

            if (!width || !height || (this.width === width && this.height === height)) {
                return;
            }
            this.width = width;
            this.height = height;
            this.svg
                .attr('width', this.width)
                .attr('height', this.height);
            this.bg
                ?.attr('width', this.width * 5)
                .attr('height', this.height * 5)
                .attr('x', -this.width * 2.5)
                .attr('y', -this.height * 2.5)
        }
    }

    private zoomed(event: any): void {
        this.svgGroup.attr('transform', event.transform);
    }

    public render(): void {
        if (!this.width || !this.height) {
            this.width = 1
            this.height = 1
        }
        this.svgGroup = this.svg.append('g');
        this.svgGroup.attr('class', 'automaton_graph');


        const defs = this.svg.append('defs');
        defs.append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 8)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', 'var(--arrow-color, #999)');


        defs.append('pattern')
            .attr('id', 'dotted-grid')
            .attr('width', 20)
            .attr('height', 20)
            .attr('patternUnits', 'userSpaceOnUse')
            .append('circle')
            .attr('cx', 5)
            .attr('cy', 5)
            .attr('r', 1.5)
            .attr('fill', 'var(--dotted-grid-color)');


        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => this.zoomed(event));

        this.svg.call(zoom);


        this.createVisualization();
    }

    private formatStateInfo(state: State): string[] {
        return state.items.map(item => stringifyItem(item));
    }

    private calculateNodeSize(el: Tree): number {
        return (this.getElementText(el).length * 10) + 16
    }

    private createVisualization(): void {
        const nodeSeparation = {
            x: 50,
            y: 70
        };

        const root = d3.hierarchy(this.tree, (d: Tree) => {
            return d.type === 'NonTerminal' ? d.value.pattern : null;
        });
        root.each(d => {
            console.log(this.calculateNodeSize(d.data));
            (d as any).nodeWidth = this.calculateNodeSize(d.data)
        });
        const treeLayout = d3.tree<Tree>()
            .size([this.width, this.height])
            .nodeSize([nodeSeparation.x, nodeSeparation.y])
            .separation((a, b) => {
                const aw = (a as any).nodeWidth;
                const bw = (b as any).nodeWidth;
                return Math.max(Math.max(aw / bw / 3, bw / aw / 3) + 0.5, 1)
            })


        const treeData = treeLayout(root);
        treeData.descendants().forEach(d => {
            d.x += this.width / 2;
            d.y += 50;
        });

        this.bg = this.svgGroup.append('rect')
            .attr('width', this.width * 20)
            .attr('height', this.height * 20)
            .attr('x', -this.width * 10)
            .attr('y', -this.height * 10)
            .attr('fill', 'url(#dotted-grid)')
            .attr('class', 'background-grid');


        this.svgGroup.selectAll('.link')
            .data(treeData.links())
            .enter().append('path')
            .attr('class', 'tree_link')
            .attr('d', d3.linkVertical<unknown, { x: number, y: number }>()
                .x(d => d.x)
                .y(d => d.y)
            )


        const node = this.svgGroup.selectAll('.node')
            .data(treeData.descendants())
            .enter().append('g')
            .attr('class', 'tree_node')
            .attr('transform', d => `translate(${d.x},${d.y})`);

        node.append('rect')
            .attr('rx', this.config.nodeSize / 2)
            .attr('ry', this.config.nodeSize / 2)
            .attr('width', d => Math.max(this.config.nodeSize, this.calculateNodeSize(d.data)))
            .attr('height', this.config.nodeSize)
            .attr('x', d => -Math.max(this.config.nodeSize, this.calculateNodeSize(d.data)) / 2)
            .attr('y', -this.config.nodeSize / 2)
            .attr('r', this.config.nodeSize)
            .attr('class', d => d.data.type === 'Terminal' ? 'tree_terminal' : 'tree_non_terminal');

        node.append('text')
            .attr('dy', this.config.nodeSize / 4 - 2)
            .attr('text-anchor', 'middle')
            .text(d => this.getElementText(d.data));
    }

    getElementText(el: Tree): string {
        if (el.type === 'Terminal') {
            return el.value.slice;
        } else {
            return el.value.symbol;
        }
    }


}

