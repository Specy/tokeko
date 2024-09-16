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
type VisualizationConfig = {
    curveFactor: number;
    labelOffset: number;
}

export class ParserVisualization {
    private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    private width: number;
    private height: number;
    private simulation: d3.Simulation<any, undefined>;
    private toDispose: (() => void)[] = [];
    automaton: Automaton;
    private target: HTMLElement;
    private svgGroup: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private config: VisualizationConfig;
    private bg: d3.Selection<SVGRectElement, unknown, HTMLElement, any>;

    constructor(automaton: Automaton, target: HTMLElement, config: Partial<VisualizationConfig> = {}) {
        this.automaton = automaton;
        this.target = target;
        this.config = {
            curveFactor: 0.1,
            labelOffset: 30,
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
            if (this.simulation) {
                this.simulation.force('center', d3.forceCenter(this.width / 2, this.height / 2));
                this.simulation.alpha(1).restart();
            }
        }
    }

    private calculateNodeWidth(stateInfo: string[]): number {
        const textLengths = stateInfo.map(info => info.length);
        const maxLength = Math.max(...textLengths);
        const charWidth = 8;
        return Math.max(100, maxLength * charWidth);
    }

    private calculateNodeHeight(stateInfo: string[]): number {
        const baseHeight = 50;
        const lineHeight = 20;
        return baseHeight + stateInfo.length * lineHeight;
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


        this.createVisualization(nodes, links);
    }

    private formatStateInfo(state: State): string[] {
        return state.items.map(item => stringifyItem(item));
    }

    private createVisualization(nodes: Node[], links: Link[]): void {
        // @ts-expect-error
        this.simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links)
                .id((d: any) => d.id)
                .distance(300)
                .strength(0.9))
            .force('charge', d3.forceManyBody().strength(-2500))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collision', d3.forceCollide().radius((d: any) => Math.max(d.width, d.height) / 2 + 50))
            .force('x', d3.forceX(this.width / 2).strength(0.2))
            .force('y', d3.forceY(this.height / 2).strength(0.2));

        const link = this.svgGroup.append('g')
            .selectAll('path')
            .data(links)
            .enter().append('path')
            .attr('class', 'automaton_link')
            .attr('marker-end', 'url(#arrowhead)');


        this.bg = this.svgGroup.append('rect')
            .attr('width', this.width * 5)
            .attr('height', this.height * 5)
            .attr('x', -this.width * 2.5)
            .attr('y', -this.height * 2.5)
            .attr('fill', 'url(#dotted-grid)')
            .attr('class', 'background-grid');


        const node = this.svgGroup.append('g')
            .selectAll('g')
            .data(nodes)
            .enter().append('g')
            .attr('class', (d, i) => i === 0 ? 'automaton_node automaton_first_node' : 'automaton_node')
            .call(d3.drag()
                .on('start', (event, d) => this.dragstarted(event, d))
                .on('drag', (event, d) => this.dragged(event, d))
                .on('end', (event, d) => this.dragended(event, d)));

        node.append('rect')
            .attr('class', 'automaton_node-bg')
            .attr('width', (d: any) => d.width)
            .attr('height', (d: any) => d.height)
            .attr('x', (d: any) => -d.width / 2)
            .attr('y', (d: any) => -d.height / 2)
            .attr('rx', 6)
            .attr('ry', 6)
            .attr('stroke-width', 2);


        node.append('rect')
            .attr('class', 'automaton_state-header-bg')
            .attr('width', (d: any) => d.width)
            .attr('height', 30)
            .attr('x', (d: any) => -d.width / 2)
            .attr('y', (d: any) => -d.height / 2)
            .attr('rx', 6)
            .attr('ry', 6);

        node.append('text')
            .attr('class', 'automaton_state-label')
            .attr('text-anchor', 'middle')
            .attr('y', (d: any) => -d.height / 2 + 20)
            .attr('font-weight', 'bold')
            .text((d: any) => d.label);

        node.append('text')
            .attr('class', 'automaton_state-info')
            .attr('text-anchor', 'start')
            .attr('x', (d: any) => -d.width / 2 + 10)
            .attr('y', (d: any) => -d.height / 2 + 35)
            .selectAll('tspan')
            .data((d: any) => d.stateInfo)
            .enter().append('tspan')
            .attr('x', function () {

                // @ts-expect-error
                const parentData = d3.select(this.parentNode).datum() as Node;
                return -parentData.width / 2 + 10;
            })
            .attr('dy', 20)
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
        const sourceNode = d.source;
        const targetNode = d.target;

        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;


        const angle = Math.atan2(dy, dx);


        const getEdgePoint = (node: any, outgoing: boolean) => {
            const nodeAngle = outgoing ? angle : angle + Math.PI;
            const xSign = Math.cos(nodeAngle) >= 0 ? 1 : -1;
            const ySign = Math.sin(nodeAngle) >= 0 ? 1 : -1;

            const halfWidth = node.width / 2;
            const halfHeight = node.height / 2;

            const ratio = Math.min(
                Math.abs(halfWidth / Math.cos(nodeAngle)),
                Math.abs(halfHeight / Math.sin(nodeAngle))
            );

            return {
                x: node.x + xSign * Math.abs(ratio * Math.cos(nodeAngle)),
                y: node.y + ySign * Math.abs(ratio * Math.sin(nodeAngle))
            };
        };

        const start = getEdgePoint(sourceNode, true);
        const end = getEdgePoint(targetNode, false);


        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        const controlX = midX + (dy * this.config.curveFactor);
        const controlY = midY - (dx * this.config.curveFactor);

        return `M${start.x},${start.y} Q${controlX},${controlY} ${end.x},${end.y}`;
    }

    private getLinkLabelPosition(d: any): [number, number] {
        const sourceNode = d.source;
        const targetNode = d.target;

        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;


        const angle = Math.atan2(dy, dx);


        const getEdgePoint = (node: any) => {
            const xSign = Math.cos(angle) >= 0 ? 1 : -1;
            const ySign = Math.sin(angle) >= 0 ? 1 : -1;

            const halfWidth = node.width / 2;
            const halfHeight = node.height / 2;

            const ratio = Math.min(
                Math.abs(halfWidth / Math.cos(angle)),
                Math.abs(halfHeight / Math.sin(angle))
            );

            return {
                x: node.x + xSign * Math.abs(ratio * Math.cos(angle)),
                y: node.y + ySign * Math.abs(ratio * Math.sin(angle))
            };
        };

        const start = getEdgePoint(sourceNode);


        const labelX = start.x + Math.cos(angle) * this.config.labelOffset;
        const labelY = start.y + Math.sin(angle) * this.config.labelOffset;


        const perpendicularOffsetDistance = 5;
        const offsetX = -Math.sin(angle) * perpendicularOffsetDistance;
        const offsetY = Math.cos(angle) * perpendicularOffsetDistance;

        return [labelX + offsetX, labelY + offsetY];
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




