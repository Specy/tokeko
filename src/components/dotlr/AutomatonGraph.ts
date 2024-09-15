import * as d3 from 'd3';

import {stringifyAtom, stringifyItem} from '@specy/dotlr/utils';
import type {Automaton, State} from '@specy/dotlr/types';


type Node = {
    id: number,
    label: string,
    stateInfo: string[]
    width: number,
    height: number
}
type Link = {
    source: number,
    target: number,
    label: string
}

export class ParserVisualization {
    private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    private width: number;
    private height: number;
    private nodeWidth: number = 140;
    private nodeHeight: number = 100;
    private simulation: d3.Simulation<any, undefined>;
    private toDispose: (() => void)[] = [];
    private automaton: Automaton;
    private target: HTMLElement;
    private svgGroup: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

    constructor(automaton: Automaton, target: HTMLElement) {
        this.automaton = automaton;
        this.target = target;
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
            this.width = container.clientWidth;
            this.height = container.clientHeight;
            this.svg
                .attr('width', this.width)
                .attr('height', this.height);
            if (this.simulation) {
                this.simulation.force('center', d3.forceCenter(this.width / 2, this.height / 2));
                this.simulation.alpha(1).restart();
            }
        }
    }

    private calculateNodeWidth(stateInfo: string[]): number {
        const textLengths = stateInfo.map(info => info.length);
        const maxLength = Math.max(...textLengths);
        const charWidth = 8; // Assuming each character roughly takes 8px
        return Math.max(100, maxLength * charWidth); // Minimum width of 100
    }

    private calculateNodeHeight(stateInfo: string[]): number {
        const baseHeight = 50; // Base height for label and padding
        const lineHeight = 16; // Height per line of stateInfo
        return baseHeight + stateInfo.length * lineHeight;
    }

    private zoomed(event: any): void {
        this.svgGroup.attr('transform', event.transform);
    }

    public render(): void {
        this.svgGroup = this.svg.append('g'); // Create a group for the entire graph

        // Add zoom behavior to the SVG
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4]) // Zoom range (min, max)
            .on('zoom', (event) => this.zoomed(event));

        this.svg.call(zoom); // Attach zoom behavior to the svg

        const nodes = this.automaton.states.map(state => {
            const stateInfo = this.formatStateInfo(state);
            const width = this.calculateNodeWidth(stateInfo);
            const height = this.calculateNodeHeight(stateInfo);

            return {
                id: state.id,
                label: `S${state.id}`,
                stateInfo: stateInfo,
                width: width,
                height: height
            } satisfies Node;
        });

        const links = this.automaton.states.flatMap(state =>
            Array.from(state.transitions.entries()).map(([pattern, targetId]) => ({
                source: state.id,
                target: targetId,
                label: stringifyAtom(pattern)
            }) satisfies Link)
        );

        // Use the svgGroup instead of svg to append elements
        this.createVisualization(nodes, links);
    }

    private formatStateInfo(state: State): string[] {
        return state.items.map(item => stringifyItem(item));
    }

    private createVisualization(nodes: Node[], links: Link[]): void {
        //@ts-expect-error
        this.simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links)
                .id((d: any) => d.id)
                .distance(300)  // Adjust the link distance for better spacing
                .strength(0.9)) // Stronger links to pull nodes together
            .force('charge', d3.forceManyBody().strength(-2500))  // Increase repulsion between nodes
            .force('center', d3.forceCenter(this.width / 2, this.height / 2)) // Center the graph
            .force('collision', d3.forceCollide().radius((d: any) => Math.max(d.width, d.height) / 2 + 50))  // Increase collision radius to avoid overlap
            .force('x', d3.forceX(this.width / 2).strength(0.2)) // Add a weak force towards the center horizontally
            .force('y', d3.forceY(this.height / 2).strength(0.2)); // Add a weak force towards the center vertically

        // Create the links, nodes, and labels inside the svgGroup for zoom and drag support
        const link = this.svgGroup.append('g')
            .selectAll('path')
            .data(links)
            .enter().append('path')
            .attr('class', 'automaton_link');

        const node = this.svgGroup.append('g')
            .selectAll('g')
            .data(nodes)
            .enter().append('g')
            .call(d3.drag()
                .on('start', (event, d) => this.dragstarted(event, d))
                .on('drag', (event, d) => this.dragged(event, d))
                .on('end', (event, d) => this.dragended(event, d)));

        node.append('rect')
            .attr('class', 'automaton_node')
            .attr('width', (d: any) => d.width)
            .attr('height', (d: any) => d.height)
            .attr('x', (d: any) => -d.width / 2)
            .attr('y', (d: any) => -d.height / 2)
            .attr('rx', 6)
            .attr('ry', 6)
            .attr('stroke-width', 2);

        node.append('text')
            .attr('class', 'automaton_state-label')
            .attr('text-anchor', 'middle')
            .attr('y', (d: any) => -d.height / 2 + 20)
            .text((d: any) => d.label);

        node.append('text')
            .attr('class', 'automaton_state-info')
            .attr('text-anchor', 'start')
            .attr('x', (d: any) => -d.width / 2 + 10)
            .attr('y', (d: any) => -d.height / 2 + 40)
            .selectAll('tspan')
            .data((d: any) => d.stateInfo)
            .enter().append('tspan')
            .attr('x', function (_, i, nodes) {
                //@ts-expect-error
                const parentData = d3.select(this.parentNode).datum();
                return -parentData.width / 2 + 10;
            })
            .attr('dy', 15)
            .text((d: any) => d);

        const linkLabel = this.svgGroup.append('g')
            .selectAll('text')
            .data(links)
            .enter().append('text')
            .attr('class', 'automaton_link-label')
            .text((d: any) => d.label);

        this.simulation.on('tick', () => {
            link.attr('d', (d: any) => this.linkArc(d));
            node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
            linkLabel.attr('transform', (d: any) => {
                const [x, y] = this.getLinkLabelPosition(d);
                return `translate(${x},${y})`;
            });
        });
    }


    private linkArc(d: any): string {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 2;
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
    }

    private getLinkLabelPosition(d: any): [number, number] {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const labelDistance = 100; // Distance from the source node

        // Normalize the direction vector (dx, dy)
        const directionX = dx / distance;
        const directionY = dy / distance;

        // Position the label closer to the source node
        const labelX = d.source.x + directionX * labelDistance;
        const labelY = d.source.y + directionY * labelDistance;

        return [labelX, labelY];
    }

    private dragstarted(event: any, d: any): void {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    private dragged(event: any, d: any): void {
        d.fx = event.x;
        d.fy = event.y;
    }

    private dragended(event: any, d: any): void {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

// Usage example:
// const automaton: Automaton = { ... }; // Your automaton data
// const visualization = new LALRVisualization(automaton, '#graph');
// visualization.render();