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

    // @wire(getTopOpportunities)
    // wiredOrders(result) {
    //     if (result.data) {
    //         this.records = result.data.opportunities;
    //         this.pickVals = result.data.pickVals;
    //         const designQueueCount = this.getCountForStatus('Closed Won');
    //         const needdesignCount = this.getCountForStatus('Closed Lost');
    //         const totalCount = designQueueCount + needdesignCount;
    //         this.opportunityTabLabel = `Opportunity (${totalCount})`;
    //     }
    // }

    

       connectedCallback() {
           getTopOpportunities()
            .then(result => {
                console.log("Inside ConnectedCallback");
                this.records = result.opportunities;
                this.pickVals = result.pickVals;
                const designQueueCount = this.getCountForStatus('Closed Won');
                const needdesignCount = this.getCountForStatus('Closed Lost');
                const totalCount = designQueueCount + needdesignCount;
                this.opportunityTabLabel = `Opportunity (${totalCount})`;

                this.pickVals = this.pickVals.map((item) => {
                if (item.stage === 'Closed Lost') {
                    return { ...item, label: 'New Closed Lost' };
                }else{
                    return { ...item, label: item.stage };
                }
                });

                const pathItemColors = ['background-color:#269D4D;', 'background-color:#F3106F;', 'background-color:#FFBD0D;', 'background-color:#8338EC;', 'background-color:#3983FC;', 'background-color:#797979'];
                this.pickVals = this.pickVals.map((item, index) => {
                    return { ...item, backgroundColor: pathItemColors[index] };
                });
            })
            .catch(error => {
                console.log('getTopOpportunities error==>',JSON.stringify(error));
                
            });
       }

    
    handleListItemDrag(event){
        this.recordId = event.detail;
    }

    getCountForStatus(status) {
        return this.pickVals.find(item => item.stage === status)?.noRecords || 0;
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
                const designQueueCount = this.getCountForStatus('Closed Won');
                const needdesignCount = this.getCountForStatus('Closed Lost');
                const totalCount = designQueueCount + needdesignCount;
                this.opportunityTabLabel = `Opportunity (${totalCount})`;

                this.pickVals = this.pickVals.map((item) => {
                if (item.stage === 'Closed Lost') {
                    return { ...item, label: 'New Closed Lost' };
                }else{
                    return { ...item, label: item.stage };
                }
                });

                const pathItemColors = ['background-color:#269D4D;', 'background-color:#F3106F;', 'background-color:#FFBD0D;', 'background-color:#8338EC;', 'background-color:#3983FC;', 'background-color:#797979'];
                this.pickVals = this.pickVals.map((item, index) => {
                    return { ...item, backgroundColor: pathItemColors[index] };
                });
                
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
