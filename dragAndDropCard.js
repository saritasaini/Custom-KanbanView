import { LightningElement, wire } from 'lwc';
import {getObjectInfo } from 'lightning/uiObjectInfoApi';
import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getTopOpportunities from '@salesforce/apex/OpportunityKanbanController.getTopOpportunities';
import updateOpprtuity from '@salesforce/apex/OpportunityKanbanController.updateOpprtuity';
export default class DragAndDropLwc extends LightningElement {
    records;
    stageList;
    pickVals;
    stageMap;
    recordId;

    @wire(getObjectInfo, {objectApiName:OPPORTUNITY_OBJECT})
    objectInfo

    @wire(getTopOpportunities)
    wiredOrders(result) {
        if (result.data) {
            this.records = result.data.opportunities;
            this.pickVals = result.data.pickVals;
            const designQueueCount = this.pickVals.find(item => item.stage === 'Closed Won')?.noRecords || 0;
            this.opportunityTabLabel = `Opportunity (${designQueueCount})`;
        }
    }
    
    handleListItemDrag(event){
        this.recordId = event.detail
    }

    handleItemDrop(event){
        let stage = event.detail
        this.updateHandler(stage)
    }
    updateHandler(stage){        
        updateOpprtuity({ recordId: this.recordId, stageName: stage })
            .then(result => {
                console.log("Updated Successfully");
                this.showToast();
                this.records = result.opportunities;
                this.pickVals = result.pickVals;
                const designQueueCount = this.pickVals.find(item => item.stage === 'Closed Won')?.noRecords || 0;
                this.opportunityTabLabel = `Opportunity (${designQueueCount})`;
                
            })
            .catch(error => {
                
            });
    }

    showToast(){
        this.dispatchEvent(
            new ShowToastEvent({
                title:'Success',
                message:'Stage updated Successfully',
                variant:'success'
            })
        )
    }
}
